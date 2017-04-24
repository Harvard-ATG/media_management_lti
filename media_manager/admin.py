from django.contrib import admin
from .models import Course, CourseModule

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_course_id', 'lti_context_id', 'lti_tool_consumer_instance_guid', 'created', 'updated')

class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'lti_resource_link_id', 'api_collection_id', 'created', 'updated')

admin.site.register(Course, CourseAdmin)
admin.site.register(CourseModule, CourseModuleAdmin)
