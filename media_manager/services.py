from django.conf import settings
from media_manager.models import Course

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

def load_course(app_lti_context):
    course_identifiers = app_lti_context.get_course_identifiiers()
    try:
        logger.info("Attempting to load local course object with course_identifiers=%s" % course_identifiers)
        course = Course.objects.get(**course_identifiers)
    except Course.DoesNotExist:
        logger.info("Load failed. Searching API with course_identifiers=%s" % course_identifiers)
        api = MediaManagementAPI(settings.MEDIA_MANAGEMENT_API_URL)
        found = api.search_courses_by_lti_identifiers(course_identifiers)
        if len(found) == 0:
            logger.info("Search returned no results, so creating course.")
            data = api.create_course(app_lti_context.get_context_title(), course_identifiers)
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

class MediaManagementAPI(object):
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def search_courses_by_lti_identifiers(self, course_identifiers):
        url = "%s/courses" % self.base_url
        params = course_identifiers.copy()

        logger.debug("API: request url: %s params: %s" % (url, params))

        r = requests.get(url, headers=self.headers, params=params)
        if r.status_code != 200:
            logger.debug("API: no such course exists with course identifiers: %s" % course_identifiers)
            return False

        return r.json()

    def create_course(self, title, course_identifiers):
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

class AppLTIContext(object):
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
    
