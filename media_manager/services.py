from builtins import object
from django.conf import settings
from django.core.exceptions import PermissionDenied
from media_manager.models import Course
from media_manager.lti import LTILaunch
from media_management_sdk import Client

import requests
import json
import logging

logger = logging.getLogger(__name__)

class CourseService(object):
    def __init__(self, lti_launch):
        self.lti_launch = lti_launch
        self.client = Client(
            client_id=settings.MEDIA_MANAGEMENT_API_CREDENTIALS["client_id"],
            client_secret=settings.MEDIA_MANAGEMENT_API_CREDENTIALS["client_secret"],
            base_url=settings.MEDIA_MANAGEMENT_API_URL,
        )

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

        self.client.authenticate(
            user_id=user_id,
            course_id=api_course_id, 
            course_permission=course_permission,
        )
        return self.client.api.access_token

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
        self.obtain_token()

        course_identifiers = self.lti_launch.get_course_identifiers()

        data = self.client.find_or_create_course(
            title=self.lti_launch.get_context_title(),
            lti_context_title=self.lti_launch.get_context_title(),
            lti_context_label=self.lti_launch.get_context_label(),
            sis_course_id=self.lti_launch.get_sis_course_id(),
            canvas_course_id=self.lti_launch.get_canvas_course_id(),
            **course_identifiers,
        )
        course_obj, _ = Course.objects.get_or_create(api_course_id=data["id"], **course_identifiers)

        return course_obj

    def get_collection(self, collection_id):
        self.obtain_token()
        return self.client.api.get_collection(collection_id)
