angular.module('media_manager').component('appSettings', {
  templateUrl: '/static/app/templates/components/settings.html',
  bindings: {},
  controller: ['AppConfig', 'Course', 'CourseCache', 'Notifications', '$q', '$uibModal', function(AppConfig, Course, CourseCache, Notifications, $q, $uibModal) {
    var ctrl = this;

    ctrl.confirmDeleteImports = false;
    ctrl.confirmDeleteImages = false;
    ctrl.confirmDeleteCollections = false;

    function notifyWhen(promise, msg) {
      return promise.then(function(data) {
        Notifications.clear().success(data.message || msg.success || msg);
      }).catch(function(data) {
        Notifications.clear().error(data.error || msg.error || msg);
      });
    }

    ctrl.deleteCollections = function() {
      console.log("deleteCollections");
      var course = Course.deleteCollections({ id: AppConfig.course_id });
      notifyWhen(course.$promise, {error: "Error deleting collections"});
      ctrl.confirmDeleteCollections = false;
      CourseCache.reload();
    };

    ctrl.deleteImages = function() {
      console.log("deleteImages");
      var course = Course.deleteImages({ id: AppConfig.course_id });
      notifyWhen(course.$promise, {error: "Error deleting collections"});
      ctrl.confirmDeleteImages = false;
      CourseCache.reload();
    };

    ctrl.deleteImports = function() {
      console.log("deleteImports");
      var course = Course.deleteCourseCopies({ id: AppConfig.course_id });
      notifyWhen(course.$promise, {success: "Cleared imports", error: "Error clearing imports"});
      ctrl.confirmDeleteImports = false;
    };

    ctrl.importCourseContent = function() {
      console.log("Import course: " + ctrl.import_course_value);
      var course = Course.copyCourse({
        id: AppConfig.course_id,
        copy_source_id: ctrl.import_course_value
      });
      notifyWhen(course.$promise, {success: "Imported completed", error: "Error importing course content"});
      course.$promise.then(function() {
        ctrl.courseCopyList = Course.getCourseCopies({ id: AppConfig.course_id });
      });
    };

    ctrl.$onInit = function() {
      ctrl.course = Course.getCourse({ id: AppConfig.course_id });
      ctrl.courseCopyList = Course.getCourseCopies({ id: AppConfig.course_id });
    };
  }]
});
