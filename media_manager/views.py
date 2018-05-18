from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from ims_lti_py.tool_config import ToolConfig
from media_manager.models import CourseModule
from media_manager.services import CourseService
from media_manager.lti import LTILaunch
from media_manager.mixins import JsonMixin
from media_manager.decorators import require_permission

import copy
import logging

logger = logging.getLogger(__name__)

class CourseViewHelper(object):
    '''
    The CourseViewHelper provides methods for retrieving the Course and CourseModule
    models that are associated with an LTI launch. It uses the CourseService to
    interact with the Media Management API.
    '''
    def __init__(self, request):
        self.request = request
        self.lti_launch = LTILaunch(request)
        self.course_service = CourseService.from_request(request)
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
    '''
    Endpoint is a view for handling JSON-based request/responses in the app.
    It dispatches to methods named after the HTTP request method and returns
    the result as JSON.
    '''
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
    '''
    The Module endpoint is a view that interacts with the CourseModule model.
    '''
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

class PageView(JsonMixin):
    '''
    The PageView is a base class for views that render HTML.
    It exists to include some helper classes that most page views will need.
    '''
    def __init__(self, request):
        self.request = request
        self.helper = CourseViewHelper(request)

    def render(self):
        raise Exception("subclass responsibility")

class AppView(PageView):
    '''
    The AppView renders and configures the AngularJS application which then has its
    own routing mechanism.
    '''
    def render(self):
        course_object = self.helper.get_course_object()
        course_module = self.helper.get_course_module()
        module_enabled = bool(course_module is not None and course_module.api_collection_id)
        if module_enabled:
            module_collection_id = course_module.api_collection_id
            angular_route = "/mirador/%s" % course_module.api_collection_id
        else:
            module_collection_id = None
            angular_route = "/collections"

        config = {
            "media_management_api": {
                "root_endpoint": settings.MEDIA_MANAGEMENT_API_URL,
                "access_token": self.helper.api_access_token(),
                "course_id": course_object.api_course_id,
            },
            "resource_link_id": self.helper.launch_resource_link_id(),
            "permissions": self.helper.launch_perms(),
            "module": {
                "collection_id": module_collection_id,
                "enabled": module_enabled,
                "endpoint": reverse("media_manager:module_endpoint"),
            },
            "angular_route": angular_route,
        }
        context = {"appConfig": self.to_json(config)}
        return render(self.request, 'index.html', context=context)

class MiradorView(PageView):
    '''
    The MiradorView renders a minimal page with the Mirador IIIF image viewer.
    It does not include any Angular components at all -- just enough to load
    Mirador itself.

    The intention is that this page will be iframed by AngularJS where needed. This
    is mostly because it isn't easy to destroy and re-create Mirador at runtime when
    a new configuration is needed. It's easier to just reload an iframe.

    See also:
        - http://www.projectmirador.org
        - https://github.com/ProjectMirador/mirador
        - https://github.com/ProjectMirador/mirador/wiki/Complete-Configuration-API
    '''
    def __init__(self, request, collection_id):
        self.collection_id = collection_id
        super(MiradorView, self).__init__(request)

    def render(self):
        course_service = CourseService.from_request(self.request)
        collection = course_service.get_collection(self.collection_id)
        manifest = collection.get('iiif_manifest', {})
        config = {
            "data": [{
                "manifestUri": manifest.get('url', ''),
                "location": manifest.get('location', '')
            }],
            "canvasID": manifest.get('canvas_id', ''),
            "metadataPluginEnabled": manifest.get('source') == 'images',
        }

        context = {
            "miradorConfig": self.to_json(config),
        }
        return render(self.request, 'mirador.html', context=context)

import django_auth_lti.patch_reverse


class LTILaunchView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(LTILaunchView, self).dispatch(*args, **kwargs)

    @method_decorator(login_required)
    def post(self, request):
        url = reverse('media_manager:index')
        return HttpResponseRedirect(url)

    def get(self, request):
        return HttpResponse('This is the LTI launch endpoint. ')

class LTIToolConfigView(View):
    '''
    Outputs LTI configuration XML for Canvas as specified in the IMS Global Common Cartridge Profile.
    The XML produced by this view can either be copy-pasted into the Canvas tool
    settings, or exposed as an endpoint to Canvas by linking to this view.
    '''
    LAUNCH_URL = settings.LTI_SETUP.get('LAUNCH_URL', 'lti_launch')
    TOOL_TITLE = settings.LTI_SETUP.get('TOOL_TITLE', 'LTI Tool')
    TOOL_DESCRIPTION = settings.LTI_SETUP.get('TOOL_DESCRIPTION', '')
    EXTENSION_PARAMETERS = settings.LTI_SETUP.get('EXTENSION_PARAMETERS', {})

    def get_launch_url(self, **kwargs):
        '''Returns the launch URL for the LTI tool.'''
        force_secure = kwargs.pop('force_secure', False)
        scheme = 'https' if force_secure or self.request.is_secure() else 'http'
        base_url = '{scheme}://{host}'.format(scheme=scheme, host=self.request.get_host())
        url = base_url + reverse(self.LAUNCH_URL, exclude_resource_link_id=True)
        return url

    def get_extension_params(self):
        '''
        Gets extension parameters on the ToolConfig() instance.
        This includes canvas-specific things like the course_navigation and privacy level:

        {
            "canvas.instructure.com": {
                "privacy_level": "public",
                "course_navigation": {
                    "enabled": "true",
                    "default": "disabled",
                    "text": "MY tool",
                }
                "custom_fields": {
                    "key1": "value1",
                    "key2": "value2",
                }
            }
        }
        '''
        result = {}
        for ext_key in self.EXTENSION_PARAMETERS:
            result[ext_key] = {}
            for ext_param in self.EXTENSION_PARAMETERS[ext_key]:
                ext_value = self.EXTENSION_PARAMETERS[ext_key][ext_param]
                if ext_param == 'course_navigation' and self.request.GET.get('course_navigation', 'yes') == 'no':
                    continue
                result[ext_key][ext_param] = ext_value
        return result

    def get_tool_config(self):
        '''Returns an instance of ToolConfig()'''
        return ToolConfig(
            title=self.TOOL_TITLE,
            description=self.TOOL_DESCRIPTION,
            launch_url=self.get_launch_url(),
            secure_launch_url=self.get_launch_url(force_secure=True),
        )

    def get(self, request):
        ''' Returns the LTI tool configuration as XML'''
        lti_tool_config = self.get_tool_config()
        ext_params = self.get_extension_params()

        for ext_key in ext_params:
            for ext_param in ext_params[ext_key]:
                ext_value = ext_params[ext_key][ext_param]
                lti_tool_config.set_ext_param(ext_key, ext_param, ext_value)

        return HttpResponse(lti_tool_config.to_xml(), content_type='text/xml', status=200)


@require_permission("read")
@require_http_methods(["GET"])
def app(request):
    return AppView(request).render()

@require_permission("read")
@require_http_methods(["GET"])
def mirador(request, collection_id):
    return MiradorView(request, collection_id).render()

@require_permission("edit")
@csrf_exempt
@require_http_methods(["GET", "POST"])
def module_endpoint(request):
    return ModuleEndpoint(request).dispatch()
