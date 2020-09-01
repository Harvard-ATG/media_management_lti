from builtins import object
from django.conf import settings
from django.core.exceptions import PermissionDenied
from media_manager.models import Course
from media_manager.lti import LTILaunch

import requests
import json
import logging

logger = logging.getLogger(__name__)

class CourseService(object):
    def __init__(self, lti_launch):
        self.lti_launch = lti_launch

    @classmethod
    def from_request(cls, request):
        lti_launch = LTILaunch(request)
        return cls(lti_launch)

    def obtain_token(self, api_course_id=None):
        if self.lti_launch.is_test_student():
            user_id = "TestStudent:%s" % self.lti_launch.get_context_id()
        else:
            user_id = self.lti_launch.get_sis_user_id()

        course_permission=None
        if api_course_id is not None:
            course_permission = self.lti_launch.get_read_write_permission()

        api = APIService()
        token_response = api.obtain_token(user_id=user_id, course_id=api_course_id, course_permission=course_permission)

        access_token = token_response.get('access_token', None)
        if access_token is None:
            raise PermissionDenied("Failed to obtain an access token")

        return access_token

    def load_course(self, raise_exception=False):
        '''
        Loads the current course model instance associated with the context identifiers.
        If none exists, it will attempt to find or create one.
        '''
        course_identifiers = self.lti_launch.get_course_identifiers()
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
        access_token = self.obtain_token()
        api = APIService(access_token=access_token)

        course_identifiers = self.lti_launch.get_course_identifiers()
        found = api.search_courses(course_identifiers)
        if len(found) == 0:
            logger.info("Search returned no results, so creating course.")
            data = api.create_course({
                "title": self.lti_launch.get_context_title(),
                "sis_course_id": self.lti_launch.get_sis_course_id(),
                "canvas_course_id": self.lti_launch.get_canvas_course_id(),
                "lti_context_id": self.lti_launch.get_context_id(),
                "lti_tool_consumer_instance_guid": self.lti_launch.get_tool_consumer_instance_guid(),
                "lti_context_title": self.lti_launch.get_context_title(),
                "lti_context_label": self.lti_launch.get_context_label(),
                "lti_tool_consumer_instance_name": self.lti_launch.get_tool_consumer_instance_name(),
            })
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

    def get_collection(self, collection_id):
        access_token = self.obtain_token()
        api = APIService(access_token=access_token)
        return api.get_collection(collection_id)

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
        logger.info("API: instance base_url=%s headers=%s" % (self.base_url, self.headers))

    def obtain_token(self, user_id=None, course_id=None, course_permission=None):
        '''
        Obtains an access token for the given user_id and scope.
        '''
        url = "%s/auth/obtain-token" % self.base_url
        post_data = {
            "client_id": self.client_credentials['client_id'],
            "client_secret": self.client_credentials['client_secret'],
            "user_id": user_id,
        }
        if course_id is not None:
            post_data.update({
                "course_id": course_id,
                "course_permission": course_permission,
            })
        logger.debug("OBTAIN TOKEN: %s" % post_data)
        r = requests.post(url, headers=self.headers, data=json.dumps(post_data))
        if r.status_code != 200:
            raise Exception("API: failed to obtain token. status_code=%s text=%s" % (r.status_code, r.text))

        logger.info("API: obtained token: %s" % (r.text))

        data = r.json()
        if not data:
            raise Exception("API: obtained token, but response is empty")

        return data

    def search_courses(self, params):
        '''
        Searches the /courses endpoint for a course using the provided query params.
        '''
        url = "%s/courses" % self.base_url
        logger.info("API: request url: %s params: %s" % (url, params))

        r = requests.get(url, headers=self.headers, params=params)
        if r.status_code != 200:
            logger.info("API: no courses found with params: %s" % params)
            return []

        return r.json()

    def create_course(self, post_data):
        '''
        Creates a new course at the /courses endpoint.
        '''
        url = "%s/courses" % self.base_url

        required = ('title', 'lti_context_id', 'lti_tool_consumer_instance_guid', 'sis_course_id')
        for field in required:
            if field not in post_data:
                raise Exception("API: missing required field: %s" % field)

        r = requests.post(url, headers=self.headers, data=json.dumps(post_data))
        if r.status_code < 200 or r.status_code > 201:
            raise Exception("API: failed to create course. status_code=%s" % r.status_code)

        logger.info("API: created course with status_code: %s response content: %s" % (r.status_code, r.content))

        data = r.json()
        if not data:
            raise Exception("API: created course, but response is empty")
        if 'id' not in data:
            raise Exception("API: created course, but no course_id")

        return data

    def get_collection(self, collection_id):
        '''
        Retrieves data from /collections/:id endpoint.
        '''
        url = "%s/collections/%s" % (self.base_url, collection_id)

        logger.info("API: request url: %s params: %s" % (url, collection_id))

        r = requests.get(url, headers=self.headers)
        if r.status_code != 200:
            raise Exception("API: failed to get collection. status_code=%s" % r.status_code)

        data = r.json()
        if not data:
            raise Exception("API: obtained ollection, but resopnse is empty")

        return data


