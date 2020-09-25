from django.test import TestCase
from .models import Course, CourseModule


# Variables for use in unit tests
LTI_CONTEXT_ID = 'some_context_id'
LTI_TOOL_CONSUMER_INSTANCE_GUID = 'some_guid'
API_COURSE_ID = 1
LTI_RESOURCE_LINK_ID = 'some_resource_link_id'
LTI_RESOURCE_LINK_TITLE = 'some_resource_link_title'
API_COLLECTION_ID = 1

# Test class for the "Course" model
class CourseModelTest(TestCase):
    
    def setUp(self):
        """
        Create a Course object.
        """
        Course.objects.create(
            lti_context_id = LTI_CONTEXT_ID,
            lti_tool_consumer_instance_guid = LTI_TOOL_CONSUMER_INSTANCE_GUID,
            api_course_id = API_COURSE_ID
        )
    
    def test_creation_of_a_course(self):
        """
        Test the successful creation of a Course object..
        """
        course = Course.objects.get(id=1)
        self.assertEqual(course.lti_context_id, LTI_CONTEXT_ID)
        self.assertEqual(course.lti_tool_consumer_instance_guid, LTI_TOOL_CONSUMER_INSTANCE_GUID)
        self.assertEqual(course.api_course_id, API_COURSE_ID)

# Test class for the "CourseModule" model
class CourseModuleModelTest(TestCase):

    def setUp(self):
        """
        Create a CourseModule object.
        """
        sample_course_obj = Course.objects.create(
            lti_context_id = LTI_CONTEXT_ID,
            lti_tool_consumer_instance_guid = LTI_TOOL_CONSUMER_INSTANCE_GUID,
            api_course_id = API_COURSE_ID
        )

        CourseModule.objects.create(
            course = sample_course_obj,
            lti_resource_link_id = LTI_RESOURCE_LINK_ID,
            lti_resource_link_title = LTI_RESOURCE_LINK_TITLE,
            api_collection_id = API_COURSE_ID
        )

    def test_creation_of_a_course_module(self):
        """
        Test the successful creation of a CourseModule object.
        """
        course_module = CourseModule.objects.get(id=1)
        self.assertEqual(course_module.lti_resource_link_id, LTI_RESOURCE_LINK_ID)
        self.assertEqual(course_module.lti_resource_link_title, LTI_RESOURCE_LINK_TITLE)
        self.assertEqual(course_module.api_collection_id, API_COLLECTION_ID)

# TODO: Add more unit tests




