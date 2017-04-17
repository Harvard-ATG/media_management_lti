from django.conf import settings
from django.shortcuts import render
from media_manager.services import CourseService
from media_manager.lti import LTILaunch
from media_manager.decorators import require_permission

import logging
import json

logger = logging.getLogger(__name__)

def index(request):
    lti_launch = LTILaunch(request)
    course_service = CourseService(lti_launch)
    course = course_service.load_course()
    if not course:
        raise Exception("Course instance required to launch tool")

    access_token = course_service.obtain_user_token(course_instance=course)

    app_config = {
        "perms": lti_launch.get_perms(),
        "resource_link_id": lti_launch.get_resource_link_id(),
        "course_id": course.api_course_id,
        "access_token": access_token,
        "media_management_api_url": settings.MEDIA_MANAGEMENT_API_URL,
    }

    context = {
        "appConfig": json.dumps(app_config, sort_keys=True, indent=4, separators=(',', ': '))
    }

    return render(request, 'index.html', context=context)

@require_permission("read")
def mirador(request, collection_id):
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
