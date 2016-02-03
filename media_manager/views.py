from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.shortcuts import render
from media_manager.models import Course
from media_manager import services

import requests
import json
import re
import logging

logger = logging.getLogger(__name__)

def index(request):
    lti_service = services.LTIService(request)
    if not lti_service.has_perm("read"):
        raise PermissionDenied

    service = services.CourseService(lti_service)
    course = service.load_course()
    if not course:
        raise Exception("Course instance required to launch tool")

    access_token = service.obtain_user_token(course_instance=course)
    
    app_config = {
        "perms": lti_service.get_perms(),
        "course_id": course.api_course_id,
        "access_token": access_token,
        "media_management_api_url": settings.MEDIA_MANAGEMENT_API_URL,
    }

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'index.html', context=context)

def mirador(request, collection_id):
    lti_service = services.LTIService(request)
    if not lti_service.has_perm("read"):
        raise PermissionDenied

    manifest_uri = "{base_url}/collections/{collection_id}/manifest"
    manifest_uri = manifest_uri.format(base_url=settings.MEDIA_MANAGEMENT_API_URL, collection_id=collection_id)
    app_config = {
        "data": [
            {"manifestUri": manifest_uri, "location": "Harvard University"},
        ]
    }

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'mirador.html', context=context)

