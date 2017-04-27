from django.core.exceptions import PermissionDenied
import re

class LTILaunchError(Exception):
    pass

class LTILaunch(object):
    def __init__(self, request):
        self.request = request
        self.launch_params = self._get_launch_params()

    def _get_launch_params(self):
        if hasattr(self.request, 'LTI') and self.request.LTI:
            return dict(self.request.LTI)
        raise LTILaunchError("Missing LTI launch parameters")
 
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

    def get_resource_link_id(self):
        return self.launch_params.get('resource_link_id', None)

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

    def require_perm(self, permission):
        if not self.has_perm(permission):
            raise PermissionDenied
