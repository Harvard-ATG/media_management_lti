from django.conf import settings
from media_manager.models import Course
from media_manager.lti import LTILaunch

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

class CourseService(object):
    def __init__(self, lti_launch):
        self.lti_launch = lti_launch
        self.api_auth = APIAuthService(user_id=lti_launch.get_sis_user_id(), perms=lti_launch.get_perms())

    @classmethod
    def from_request(cls, request):
        return cls(LTILaunch(request))

    def load_course(self, raise_exception=False):
        '''
        Loads the current course model instance associated with the context identifiers.
        If none exists, it will attempt to find or create one.
        '''
        course_identifiers = self.lti_launch.get_course_identifiiers()
        try:
            logger.info("Attempting to load local course object with course_identifiers=%s" % course_identifiers)
            course = Course.objects.get(**course_identifiers)
        except Course.DoesNotExist:
            logger.info("Finding or creating API with course_identifiers=%s" % course_identifiers)
            course = self.find_or_create_course()

        if raise_exception and not course:
            raise Exception("Error loading course instance")

        return course

    def find_or_create_course(self):
        '''
        Searches the API for a course with matching context identifiers (context_id and tool_consumer_instance_guid),
        or if none exists, creates a new course context in the API.
        '''
        create_token = self.api_auth.obtain_create_token(raise_exception=True)
        course_identifiers = self.lti_launch.get_course_identifiiers()
        api = APIService(access_token=create_token)
        found = api.search_courses(course_identifiers)
        if len(found) == 0:
            logger.info("Search returned no results, so creating course.")
            data = api.create_course(self.lti_launch.get_context_title(), course_identifiers)
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

    def obtain_user_token(self, course_instance):
        return self.api_auth.obtain_user_token(course_instance=course_instance)

class APIAuthService(object):
    def __init__(self, user_id, perms):
        self.user_id = user_id
        self.perms = perms

    def obtain_create_token(self):
        '''
        Returns an access token that has sufficient privilege to *create* a course.
        '''
        if not self.perms['edit']:
            raise Exception("Insufficient permission to obtain create token")
        return self.obtain_token(course_instance=None, raise_exception=True)

    def obtain_user_token(self, course_instance=None):
        '''
        Returns an access token to read or write to a specific course.
        '''
        if course_instance is None:
            raise Exception("Course instance required to obtain a user token")
        return self.obtain_token(course_instance=course_instance, raise_exception=True)

    def obtain_token(self, course_instance=None, raise_exception=False):
        '''
        Returns an access token for the current user.
        '''
        if self.perms['edit']:
            scope_perm = 'write'
        elif self.perms['read']:
            scope_perm = 'read'
        else:
            raise Exception("Insufficient permission to obtain token")

        if course_instance is None:
            scope_obj = '*'
        else:
            scope_obj = str(course_instance.api_course_id)

        scope = "%s:course:%s" % (scope_perm, scope_obj)

        token_response = APIService().obtain_token(self.user_id, scope)
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
