from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.shortcuts import render
from media_manager.models import Course
from media_manager.services import MediaManagementAPI, AppLTIContext

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

def index(request):
    app_lti_context = AppLTIContext(request)
    if not app_lti_context.has_perm("read"):
        raise PermissionDenied

    course_identifiers = {
        "lti_context_id": app_lti_context.get_context_id(),
        "lti_tool_consumer_instance_guid": app_lti_context.get_tool_consumer_instance_guid()
    }

    try:
        course = Course.objects.get(**course_identifiers)
    except Course.DoesNotExist:
        logger.info("First launch with course identifiers: %s" % course_identifiers)
        api = MediaManagementAPI(settings.MEDIA_MANAGEMENT_API_URL)
        course = api.create_course(app_lti_context.get_context_title(), course_identifiers)
    
    app_config = {
        "perms": app_lti_context.get_perms(),
        "user_id": app_lti_context.get_user_id(),
        "course_id": course.api_course_id,
        "media_management_api_url": settings.MEDIA_MANAGEMENT_API_URL,
    }

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'index.html', context=context)

def mirador(request, collection_id):
    app_lti_context = AppLTIContext(request)
    if not app_lti_context.has_perm("read"):
        raise PermissionDenied

    manifest_uri = "{base_url}/collections/{collection_id}/manifest"
    manifest_uri = manifest_uri.format(base_url=settings.MEDIA_MANAGEMENT_API_URL, collection_id=collection_id)
    app_config = {
        "data": [{"manifestUri": manifest_uri, "location": "Harvard University"}]
    }

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'mirador.html', context=context)

