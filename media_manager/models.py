from builtins import object
from django.db import models

class Course(models.Model):
    lti_context_id = models.CharField(max_length=128, null=True)
    lti_tool_consumer_instance_guid = models.CharField(max_length=1024, null=True)
    api_course_id = models.IntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta(object):
        verbose_name = 'course'
        verbose_name_plural = 'courses'
        unique_together = ("lti_context_id", "lti_tool_consumer_instance_guid")

    def __unicode__(self):
        return "{0}".format(self.lti_context_id)

class CourseModule(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    lti_resource_link_id = models.CharField(max_length=1024, null=False)
    lti_resource_link_title = models.CharField(max_length=4096, null=False, blank=True, default='')
    api_collection_id = models.IntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta(object):
        verbose_name = 'module'
        verbose_name_plural = 'module'

    def __unicode__(self):
        return "{0}".format(self.lti_resource_link_title)

    def asData(self):
        return {
            "id": self.pk,
            "collection_id": self.api_collection_id,
            "resource_link_id": self.lti_resource_link_id,
        }
