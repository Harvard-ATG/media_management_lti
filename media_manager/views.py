from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
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

    def set_module_collection(self, collection_id=None):
        course_module = self.get_course_module()
        if course_module is None:
            attrs = {
                "course": self.get_course_object(),
                "lti_resource_link_id": self.lti_launch.get_resource_link_id()
            }
            course_module = CourseModule(**attrs)
        course_module.api_collection_id = collection_id
        course_module.save()
        return course_module

    def update_module_settings(self):
        result = {}
        if 'collection_id' in self.request.POST:
            collection_id = self.request.POST['collection_id']
            logger.debug("Update module collection: %s" % collection_id)
            module = self.set_module_collection(collection_id=collection_id)
            result["message"] = "Successfully updated module collection to: %s" % collection_id
            result["data"] = module.asData()
        else:
            result["message"] = "No collection_id specified."
        return HttpResponse(content_type='application/json', content=self.jsonify(result))

    def render_module_settings(self):
        result = {}
        module = self.get_course_module()
        if module is None:
            result["message"] = "Module not configured"
        else:
            result["message"] = "Module settings found"
            result["data"] = module.asData() if module else False
        return HttpResponse(content_type='application/json', content=self.jsonify(result))

    def render_module(self):
        module = self.get_course_module()
        show_mirador = module is not None and module.api_collection_id
        if show_mirador:
            return self.render_mirador(module.api_collection_id)
        return self.render_index()

    def render_index(self):
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
    return MediaManagerView(request).render_module()

@require_permission("read")
def mirador(request, collection_id):
    return MediaManagerView(request).render_mirador(collection_id)

@require_permission("edit")
@require_http_methods(["GET", "POST"])
def module_settings(request):
    view = MediaManagerView(request)
    if request.method == "GET":
        return view.render_module_settings()
    elif request.method == "POST":
        return view.update_module()
    raise Http404("Invalid request method")
