from django.conf import settings
from django.shortcuts import render
from media_manager.models import CourseModule
from media_manager.services import CourseService
from media_manager.lti import LTILaunch
from media_manager.decorators import require_permission

import logging
import json

logger = logging.getLogger(__name__)

class MediaManagerView(object):
    def __init__(self, request):
        self.request = request
        self.lti_launch = LTILaunch(request)
        self.course_service = CourseService(self.lti_launch)
        self.course_object = None

    def jsonify(self, data):
        return json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))

    def get_course_object(self):
        if self.course_object is not None:
            return self.course_object
        self.course_object = self.course_service.load_course(raise_exception=True)
        return self.course_object

    def get_course_module(self):
        filters = {
            "course": self.get_course_object(),
            "lti_resource_link_id": self.lti_launch.get_resource_link_id(),
        }
        if CourseModule.objects.filter(**filters).exists():
            return CourseModule.objects.filter(**filters)[0]
        return None

    def get_access_token(self):
        return self.course_service.obtain_user_token(course_instance=self.get_course_object())

    def render_module_or_list(self):
        course_module_object = self.get_course_module()
        if course_module_object is None:
            return self.render_list()
        else:
            return self.render_mirador(course_module_object.api_collection_id)

    def render_list(self):
        app_config = {
            "perms": self.lti_launch.get_perms(),
            "resource_link_id": self.lti_launch.get_resource_link_id(),
            "course_id": self.get_course_object().api_course_id,
            "access_token": self.get_access_token(),
            "media_management_api_url": settings.MEDIA_MANAGEMENT_API_URL,
        }
        context = {"appConfig": self.jsonify(app_config)}
        return render(self.request, 'index.html', context=context)

    def render_mirador(self, collection_id):
        manifest_uri = "{base_url}/collections/{collection_id}/manifest"
        manifest_uri = manifest_uri.format(base_url=settings.MEDIA_MANAGEMENT_API_URL, collection_id=collection_id)
        app_config = {
            "data": [
                {"manifestUri": manifest_uri, "location": "Harvard University"},
            ]
        }
        context = {"appConfig": self.jsonify(app_config)}
        return render(self.request, 'mirador.html', context=context)

@require_permission("read")
def index(request):
    view = MediaManagerView(request)
    return view.render_module_or_list()

@require_permission("read")
def mirador(request, collection_id):
    view = MediaManagerView(request)
    return view.render_mirador(collection_id)
