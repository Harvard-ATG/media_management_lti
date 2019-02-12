angular.module('media_manager').component('appImageLibraryList', {
  templateUrl: '/static/app/templates/components/imageLibraryList.html',
  bindings: {
    courseImages: "<",
    onAddToCollection: "&",
    onInCollection: "&",
  },
  controller: ['$log', '$location', '$scope', function($log, $location, $scope) {
    var ctrl = this;

    ctrl.addToCollection = function(courseImage) {
      ctrl.onAddToCollection({ "$event": courseImage });
    };

    ctrl.inCollection = function(courseImage) {
      return ctrl.onInCollection({ "$event": courseImage });
    };

    ctrl.goToImageView = function (courseImage) {
      $location.path('/image/' + courseImage.id);
    };

    ctrl.$onInit = function() {};
    ctrl.$onChanges = function(changes) {
      $log.log("imageLibraryListChanges", changes);
      if(changes.hasOwnProperty('courseImages') && !changes.courseImages.isFirstChange()) {
        ctrl.courseImages = changes.courseImages.currentValue;
      }
    };

  }]
});
