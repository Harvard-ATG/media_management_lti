from django.contrib import admin
from .models import Course

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_course_id', 'lti_context_id', 'lti_tool_consumer_instance_guid', 'created', 'updated')

admin.site.register(Course, CourseAdmin)

