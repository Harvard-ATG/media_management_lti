from media_manager.models import Course

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

class MediaManagementAPI(object):
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def create_course(self, title, course_identifiers):
        url = "%s/courses" % self.base_url

        post_data = {}
        post_data.update({"title": title})
        post_data.update(course_identifiers)    

        logger.debug("Making request to API url: %s post data: %s" % (url, post_data))
        
        r = requests.post(url, headers=self.headers, data=json.dumps(post_data))
        if r.status_code < 200 or r.status_code > 201:
            raise Exception("API: failed to create course. status_code=%s" % r.status_code)
        
        logger.debug("API: created course with status_code: %s response content: %s" % (r.status_code, r.content))
        
        data = r.json()
        if not data:
            raise Exception("API: created course, but response is empty")
        if 'id' not in data:
            raise Exception("API: created course, but no course_id")

        api_course_id = data['id']
        course = Course(api_course_id=api_course_id, **course_identifiers)
        course.save()
        logger.debug("Created course object with api_course_id=%s " % api_course_id)

        return course

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
    
