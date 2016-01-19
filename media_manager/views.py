from django.http import HttpResponse
from django.template import RequestContext, loader
from django_app_lti.views import LTILaunchView

import json
import re

def index(request):

    template = loader.get_template('index.html')
    edit = False;
    if re.search('Instructor', request.LTI['roles'][0]):
        edit = True;
    context = {
        "edit": edit,
        "user_id": request.user.username,
        "course_id": request.LTI['custom_canvas_course_id'],
    };
    request_context = RequestContext(request, context)

    return HttpResponse(template.render(request_context))

class MyLTILaunchView(LTILaunchView):
    def hook_before_post(self, request):
        super(MyLTILaunchView, self).hook_before_post(request)
        print "before post"

    def hook_process_post(self, request):
        super(MyLTILaunchView, self).hook_process_post(request)
        print "process post"

    def hook_after_post(self, request):
        super(MyLTILaunchView, self).hook_after_post(request)
        print "after post"

    def hook_get_redirect(self):
        print "get redirect"
        return super(MyLTILaunchView, self).hook_get_redirect()
