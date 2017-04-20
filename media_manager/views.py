from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.views.generic import View
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.urlresolvers import reverse
from media_manager.models import CourseModule
from media_manager.services import CourseService
from media_manager.lti import LTILaunch
from media_manager.mixins import JsonMixin
from media_manager.decorators import require_permission

import logging

logger = logging.getLogger(__name__)

class CourseViewHelper(object):
    def __init__(self, request):
        self.request = request
        self.lti_launch = LTILaunch(request)
        self.course_service = CourseService(self.lti_launch)
        self.course_object = None

    def get_course_object(self):
        if self.course_object is not None:
            return self.course_object
        self.course_object = self.course_service.load_course(raise_exception=True)
        return self.course_object

    def get_course_module(self):
        filters = {
            "course": self.get_course_object(),
            "lti_resource_link_id": self.launch_resource_link_id(),
        }
        if CourseModule.objects.filter(**filters).exists():
            return CourseModule.objects.filter(**filters)[0]
        return None

    def launch_resource_link_id(self):
        return self.lti_launch.get_resource_link_id()

    def launch_perms(self):
        return self.lti_launch.get_perms()

    def api_access_token(self):
        return self.course_service.obtain_user_token(course_instance=self.get_course_object())

class Endpoint(object):
    def __init__(self, request):
        self.request = request
        self.lti_launch = LTILaunch(request)

    def dispatch(self):
        method = self.request.method.lower()
        if hasattr(self, method):
            result, code = getattr(self, method)()
        else:
            raise Http404("Invalid request method: %s" % self.request.method)
        return self.response(result, status=code)

    def response(self, data, status=200):
        content = self.to_json(data)
        return HttpResponse(content=content, content_type='application/json', status=status)

class ModuleEndpoint(Endpoint, JsonMixin):
    def __init__(self, request):
        self.request = request
        self.helper = CourseViewHelper(request)

    def set_module_collection(self, collection_id=None):
        course_module = self.helper.get_course_module()
        if course_module is None:
            attrs = {
                "course": self.helper.get_course_object(),
                "lti_resource_link_id": self.helper.launch_resource_link_id()
            }
            course_module = CourseModule(**attrs)
        course_module.api_collection_id = collection_id
        course_module.save()
        return course_module

    def post(self):
        code = 200
        result = {}
        body = self.from_json(self.request.body)
        if 'collection_id' in body:
            collection_id = body['collection_id']
            logger.debug("Update module collection: %s" % collection_id)
            module = self.set_module_collection(collection_id=collection_id)
            result["message"] = "Successfully updated module collection to: %s" % collection_id
            result["data"] = module.asData()
        else:
            code = 400
            result["message"] = "No collection_id specified."
        return result, code

    def get(self):
        code = 200
        result = {}
        module = self.helper.get_course_module()
        if module is None:
            result["message"] = "Module not configured"
        else:
            result["message"] = "Module settings found"
            result["data"] = module.asData() if module else False
        return result, code

class MainView(JsonMixin):
    def __init__(self, request):
        self.request = request
        self.helper = CourseViewHelper(request)

    def render_index(self):

        if display_mirador:
            return self.render_mirador(module.api_collection_id)
        return self.render_collections()

    def render_app(self):
        course_object = self.helper.get_course_object()
        course_module = self.helper.get_course_module()
        module_enabled = bool(course_module is not None and course_module.api_collection_id)
        if module_enabled:
            angular_route = "/mirador/%s" % course_module.api_collection_id
        else:
            angular_route = "/collections"

        config = {
            "media_management_api": {
                "root_endpoint": settings.MEDIA_MANAGEMENT_API_URL,
                "access_token": self.helper.api_access_token(),
                "course_id": course_object.api_course_id,
            },
            "resource_link_id": self.helper.launch_resource_link_id(),
            "permissions": self.helper.launch_perms(),
            "endpoints": {
                "module": reverse("media_manager:module_endpoint"),
            },
            "module": {
                "collection_id": course_module.api_collection_id,
                "enabled": module_enabled,
            },
            "angular_route": angular_route,
        }
        context = {"appConfig": self.to_json(config)}
        return render(self.request, 'index.html', context=context)

    def render_mirador(self, collection_id):
        manifest_uri = "{base_url}/collections/{collection_id}/manifest"
        manifest_uri = manifest_uri.format(base_url=settings.MEDIA_MANAGEMENT_API_URL, collection_id=collection_id)
        config = {
            "data": [{"manifestUri": manifest_uri, "location": "Harvard University"}]
        }
        context = {
            "miradorConfig": self.to_json(config)
        }
        return render(self.request, 'mirador.html', context=context)

@require_permission("read")
@require_http_methods(["GET"])
def app(request):
    return MainView(request).render_app()

@require_permission("read")
@require_http_methods(["GET"])
def mirador(request, collection_id):
    return MainView(request).render_mirador(collection_id)

@require_permission("edit")
@csrf_exempt
@require_http_methods(["GET", "POST"])
def module_endpoint(request):
    return ModuleEndpoint(request).dispatch()
