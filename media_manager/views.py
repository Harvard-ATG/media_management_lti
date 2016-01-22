from django.http import HttpResponse
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.shortcuts import render
from django.template import RequestContext, loader
from django_app_lti.views import LTILaunchView

import json
import re

def index(request):
    app_lti_context = AppLTIContext(request)
    app_config = {
        "perms": app_lti_context.get_perms(),
        "user_id": app_lti_context.get_user_id(),
        "context_id": app_lti_context.get_context_id(),
        "course_id": 1,
        "media_management_api_url": settings.MEDIA_MANAGEMENT_API_URL,
    }

    if not app_lti_context.has_perm("read"):
        raise PermissionDenied

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'index.html', context=context)

class AppLTIContext(object):
    def __init__(self, request):
        self.request = request
        self.launch_params = self._get_launch_params()

    def _get_launch_params(self):
        launch_params = {}
        LTI = getattr(self.request, 'LTI', None)
        if LTI is not None:
            launch_params.update(self.request.LTI)
        return launch_params

    def get_user_id(self):
        return self.launch_params.get('user_id', None)
    
    def get_context_id(self):
        return self.launch_params.get('context_id', None)
    
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
    