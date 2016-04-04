from django import template
from django.conf import settings

register = template.Library()

STATIC_URL = settings.STATIC_URL
APP_BUILD_JSON = settings.APP_BUILD_JSON

@register.simple_tag
def static_build(path):
    if APP_BUILD_JSON is not None and path in APP_BUILD_JSON:
        return STATIC_URL + APP_BUILD_JSON[path]
    return STATIC_URL + path