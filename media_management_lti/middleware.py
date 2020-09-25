from builtins import object
from media_manager.lti import LTILaunchError
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
import logging

logger = logging.getLogger(__name__)

class LtiExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, LTILaunchError):
            logger.error(exception.message)
            return HttpResponse('LTI Error. Please try relaunching the tool.')
        else:
            return None
