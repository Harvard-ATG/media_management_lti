from django.db import models

class Course(models.Model):
    lti_context_id = models.CharField(max_length=128, null=True)
    lti_tool_consumer_instance_guid = models.CharField(max_length=1024, null=True)
    api_course_id = models.IntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'course'
        verbose_name_plural = 'courses'
        unique_together = ("lti_context_id", "lti_tool_consumer_instance_guid")

    def __unicode__(self):
        return "{0}".format(self.lti_context_id)
