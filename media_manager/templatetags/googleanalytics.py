from django import template
from django.conf import settings

register = template.Library()

@register.inclusion_tag('_googleanalytics.html')
def include_google_analytics():
    tracking_id = ''
    if hasattr(settings, 'GOOGLE_ANALYTICS_TRACKING_ID'):
        tracking_id = settings.GOOGLE_ANALYTICS_TRACKING_ID or ''
    return {"tracking_id": tracking_id}