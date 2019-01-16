from django.core.exceptions import PermissionDenied
import re
import logging

logger = logging.getLogger(__name__)

class LTILaunchError(Exception):
    pass

class LTILaunch(object):
    def __init__(self, request):
        self.request = request
        self._check_request()
        self.launch_params = self._get_params()

    def _check_request(self):
        if not self.request.session:
            raise LTILaunchError("Session is not initialized")
        elif 'LTI_LAUNCH' not in self.request.session:
            raise LTILaunchError("Session is missing LTI_LAUNCH dict.")
        else:
            session_keys = self.request.session['LTI_LAUNCH'].keys()
            if len(session_keys) == 0:
                raise LTILaunchError("Session LTI_LAUNCH dict is empty")

        if not ('resource_link_id' in self.request.GET or 'resource_link_id' in self.request.POST):
            raise LTILaunchError('Missing resource_link_id from GET/POST to lookup LTI_LAUNCH in session')

    def _get_params(self):
        if hasattr(self.request, 'LTI') and self.request.LTI:
            return dict(self.request.LTI)
        return dict()

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

    def get_sis_course_id(self):
        return self.launch_params.get('lis_course_offering_sourcedid', None)

    def get_context_id(self):
        return self.launch_params.get('context_id', None)

    def get_context_label(self):
        return self.launch_params.get('context_label', None)

    def get_canvas_course_id(self):
        return self.launch_params.get('custom_canvas_course_id', None)

    def get_resource_link_id(self):
        return self.launch_params.get('resource_link_id', None)

    def get_context_title(self):
        return self.launch_params.get('context_title', None)

    def get_tool_consumer_instance_guid(self):
        return self.launch_params.get('tool_consumer_instance_guid', None)

    def get_tool_consumer_instance_name(self):
        return self.launch_params.get('tool_consumer_instance_name', None)

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

    def require_perm(self, permission):
        if not self.has_perm(permission):
            raise PermissionDenied
