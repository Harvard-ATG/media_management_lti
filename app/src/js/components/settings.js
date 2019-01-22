angular.module('media_manager').component('appSettings', {
  templateUrl: '/static/app/templates/components/settings.html',
  bindings: {},
  controller: ['AppConfig', 'Course', 'CourseCache', 'Notifications', '$q', '$uibModal', function(AppConfig, Course, CourseCache, Notifications, $q, $uibModal) {
    var ctrl = this;

    ctrl.confirmDeleteImports = false;
    ctrl.confirmDeleteImages = false;
    ctrl.confirmDeleteCollections = false;

    var _searchMap = {}; // holds mapping of search strings to course response objects

    ctrl.searchCourses = function(val) {
      console.log("searchCourses", val);
      var course = Course.searchCourses({q: val});
      return course.$promise.then(function(response) {
        _searchMap = {};
        var key = "", results = [];
        for(var i = 0; i < response.length; i++) {
          key = response[i].title + " (SIS ID: " + response[i].sis_course_id + " ID: " + response[i].id +")";
          _searchMap[key] = response[i];
          results.push(key);
        }
        return results;
      }).catch(function() {
        _searchMap = {};
      });
    };

    ctrl.deleteCollections = function() {
      console.log("deleteCollections");
      var course = Course.deleteCollections({ id: AppConfig.course_id });
      var promise = Notifications.handlePromise(course.$promise, {msgProp: "message", errorText: "Error deleting collections"});
      promise.then(CourseCache.reload);
      ctrl.confirmDeleteCollections = false;
    };

    ctrl.deleteImages = function() {
      console.log("deleteImages");
      var course = Course.deleteImages({ id: AppConfig.course_id });
      var promise = Notifications.handlePromise(course.$promise, {msgProp: "message", errorText: "Error deleting images"});
      promise.then(CourseCache.reload);
      ctrl.confirmDeleteImages = false;
    };

    ctrl.deleteImports = function() {
      console.log("deleteImports");
      var course = Course.deleteCourseCopies({ id: AppConfig.course_id });
      var promise = Notifications.handlePromise(course.$promise, {msgText: "Cleared imports", errorText: "Error clearing imports"});
      ctrl.confirmDeleteImports = false;
    };

    ctrl.importCourseContent = function() {
      var course_object = _searchMap[ctrl.import_course_value];
      var copy_source_id = (course_object ? course_object.id : null);
      console.log("importCourse", copy_source_id, ctrl.import_course_value, _searchMap, course_object);

      var course = Course.copyCourse({id: AppConfig.course_id, copy_source_id: copy_source_id});
      var promise = Notifications.handlePromise(course.$promise, {msgText: "Imported completed", errorText: "Error importing course content"});
      promise.then(function() {
        ctrl.courseCopyList = Course.getCourseCopies({ id: AppConfig.course_id });
        CourseCache.reload();
      });
    };

    ctrl.$onInit = function() {
      ctrl.course = Course.getCourse({ id: AppConfig.course_id });
      ctrl.courseCopyList = Course.getCourseCopies({ id: AppConfig.course_id });
    };
  }]
});
