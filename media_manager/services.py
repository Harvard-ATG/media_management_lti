from django.conf import settings
from media_manager.models import Course

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

class CourseService(object):
    def __init__(self, lti_service):
        self.lti_service = lti_service

    def load_course(self):
        '''
        Loads the current course model instance associated with the context identifiers.
        If none exists, it will attempt to find or create one.
        '''
        course_identifiers = self.lti_service.get_course_identifiiers()
        try:
            logger.info("Attempting to load local course object with course_identifiers=%s" % course_identifiers)
            course = Course.objects.get(**course_identifiers)
        except Course.DoesNotExist:
            logger.info("Finding or creating API with course_identifiers=%s" % course_identifiers)
            course = self.find_or_create_course()
        return course
    
    def find_or_create_course(self):
        '''
        Searches the API for a course with matching context identifiers (context_id and tool_consumer_instance_guid),
        or if none exists, creates a new course context in the API.
        '''
        create_token = self.obtain_create_token(raise_exception=True)
        course_identifiers = self.lti_service.get_course_identifiiers()
        api = APIService(access_token=create_token)
        found = api.search_courses(course_identifiers)
        if len(found) == 0:
            logger.info("Search returned no results, so creating course.")
            data = api.create_course(self.lti_service.get_context_title(), course_identifiers)
            api_course_id = data['id']
        elif len(found) == 1:
            api_course_id = found[0]['id']
            logger.info("Search found a course with api_course_id=%s" % api_course_id)
        else:
            err_msg = "Multiple courses exist with course identifiers %s. Only zero or one course should exist with those identifiers." % course_identifiers
            logger.error(err_msg)
            raise Exception(err_msg)
        course = Course(api_course_id=api_course_id, **course_identifiers)
        course.save()
        logger.info("Created course object with api_course_id=%s and course_identifiers=%s" % (api_course_id, course_identifiers))
        return course
    
    def obtain_create_token(self, raise_exception=False):
        '''
        Returns an access token that has sufficient privilege to *create* a course.
        '''
        user_id = self.lti_service.get_sis_user_id()
        token_response = APIService().obtain_token(user_id, "write:course:*")
        access_token = token_response.get('access_token', None)
        if raise_exception and access_token is None:
            raise Exception("Failed to obtain an access token")
        return access_token

    def obtain_user_token(self, course_instance=None, raise_exception=False):
        '''
        Returns an access token with permissions appropriate for the current user.
        '''
        user_id = self.lti_service.get_sis_user_id()
        perms = self.lti_service.get_perms()
    
        if perms['edit']:
            scope_perm = 'write'
        else:
            scope_perm = 'read'
    
        if course_instance is None:
            scope_obj = '*'
        else:
            scope_obj = str(course_instance.api_course_id)
        
        scope = "%s:course:%s" % (scope_perm, scope_obj)
    
        token_response = APIService().obtain_token(user_id, scope)
        access_token = token_response.get('access_token', None)
        if raise_exception and access_token is None:
            raise Exception("Failed to obtain an access token")
        return access_token

class APIService(object):
    def __init__(self, access_token=None):
        self.base_url = settings.MEDIA_MANAGEMENT_API_URL
        if not settings.DEBUG and not self.base_url.startswith('https://'):
            raise Exception("API requests *must* be via SSL to protect client credentials and access tokens.")

        self.client_credentials = settings.MEDIA_MANAGEMENT_API_CREDENTIALS

        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        if access_token is not None:
            self.headers['Authorization'] = "Token %s" % access_token

        logger.debug("API: instance base_url=%s headers=%s" % (self.base_url, self.headers))

    def search_courses(self, course_identifiers):
        '''
        Searches the /courses endpoint for a course with matching course identifiers. Expects
        the course_identifiers to be a dictionary with the following keys:
        
            - lti_context_id : the LTI launch parameter "context_id"
            - lti_tool_consumer_instance_guid : the LTI launch parameter "tool_consumer_instance_guid"
        '''
        url = "%s/courses" % self.base_url
        params = course_identifiers.copy()

        logger.debug("API: request url: %s params: %s" % (url, params))

        r = requests.get(url, headers=self.headers, params=params)
        if r.status_code != 200:
            logger.debug("API: no such course exists with course identifiers: %s" % course_identifiers)
            return []

        return r.json()

    def create_course(self, title, course_identifiers):
        '''
        Creates a new course at the /courses endpoint.
        '''
        url = "%s/courses" % self.base_url

        post_data = {}
        post_data.update({"title": title})
        post_data.update(course_identifiers)    

        logger.debug("API: request url: %s post data: %s" % (url, post_data))
        
        r = requests.post(url, headers=self.headers, data=json.dumps(post_data))
        if r.status_code < 200 or r.status_code > 201:
            raise Exception("API: failed to create course. status_code=%s" % r.status_code)
        
        logger.debug("API: created course with status_code: %s response content: %s" % (r.status_code, r.content))
        
        data = r.json()
        if not data:
            raise Exception("API: created course, but response is empty")
        if 'id' not in data:
            raise Exception("API: created course, but no course_id")

        return data
    
    def obtain_token(self, user_id, scope):
        '''
        Obtains anaccess token for the given user_id and scope.
        '''
        url = "%s/auth/obtain-token" % self.base_url

        post_data = {
            "client_id": self.client_credentials['client_id'],
            "client_secret": self.client_credentials['client_secret'],
            "user_id": user_id,
            "scope": scope,
        }

        r = requests.post(url, headers=self.headers, data=json.dumps(post_data))
        if r.status_code != 200:
            raise Exception("API: failed to obtain token. status_code=%s text=%s" % (r.status_code, r.text))

        logger.debug("API: obtained token: %s" % (r.text))

        data = r.json()
        if not data:
            raise Exception("API: obtained token, but response is empty")

        return data

class LTIService(object):
    def __init__(self, request):
        self.request = request
        self.launch_params = self._get_launch_params()

    def _get_launch_params(self):
        launch_params = {}
        if 'LTI_LAUNCH' in self.request.session:
            launch_params.update(self.request.session['LTI_LAUNCH'])
        else:
            raise Exception("Missing LTI launch parameters")
        return launch_params

    def get_course_identifiiers(self):
        course_identifiers = {
            "lti_context_id": self.get_context_id(),
            "lti_tool_consumer_instance_guid": self.get_tool_consumer_instance_guid()
        }
        return course_identifiers

    def get_user_id(self):
        return self.launch_params.get('user_id', None)
    
    def get_sis_user_id(self):
        return self.launch_params.get('lis_person_sourcedid', None)
    
    def get_context_id(self):
        return self.launch_params.get('context_id', None)

    def get_context_title(self):
        return self.launch_params.get('context_title', None)

    def get_tool_consumer_instance_guid(self):
        return self.launch_params.get('tool_consumer_instance_guid', None)
    
    def get_perms(self):
        perms = {
            "read": False,
            "edit": False,
        }
    
        if 'roles' in self.launch_params:
            role_str = ','. join(self.launch_params['roles'])
            perms["read"] = bool(re.search('Learner|Instructor|Administrator|TeachingAssistant', role_str))
            perms["edit"] = bool(re.search('Instructor|Administrator|TeachingAssistant', role_str))
    
        return perms
    
    def has_perm(self, permission):
        perms = self.get_perms()
        return perms[permission] is True
    
