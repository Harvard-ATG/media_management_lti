angular.module('media_manager')
.directive('appCollectionEditLibrary', ['AppConfig', 'Course', 'CourseCache', 'Droplet', 'Notifications', 'Preferences', function(AppConfig, Course, CourseCache, Droplet, Notifications, Preferences) {
  var FILE_STATS = {
    filesToUpload: 0,
    fileUploadSize: 0
  };

  return {
    restrict: 'E',
    scope: {},
    bindToController: {
      onAddImage: '&',
      collectionImages: '='
    },
    controller: ['$scope', '$location', '$log', function($scope, $location, $log) {
      var ctrl = this;

      ctrl.courseImages = CourseCache.images;
      ctrl.notifications = Notifications;
      ctrl.Droplet = Droplet;
      ctrl.layout = Preferences.get(Preferences.UI_WORKSPACE_LAYOUT);
      ctrl.fileStats = FILE_STATS;
      ctrl.webimage = {"title": "", "url": ""};
      ctrl.sortChoices = [
        {'label': 'Newest to Oldest', 'name': 'created', 'dir': 'desc'},
        {'label': 'Oldest to Newest', 'name': 'created', 'dir': 'asc'},
        //{'label': 'Last Updated', 'name': 'updated', 'dir': 'desc'},
        {'label': 'Title', 'name': 'title', 'dir': 'asc'},
      ];

      ctrl.sortLibrary = function(choice) {
        CourseCache.updateSort(choice.name, choice.dir).sortImages();
      };

      ctrl.onClickSortLibrary = function($event, choice) {
        $event.preventDefault();
        ctrl.sortLibrary(choice);
      };

      ctrl.courseImageHasUrl = function(value, index, array) {
        return value.image_url != "";
      };

      ctrl.inCollection = function(courseImage){
        return ctrl.checkCourseImageInCollection(courseImage);
      };


      ctrl.checkCourseImageInCollection = function(courseImage) {
        var images = ctrl.collectionImages;
        if(!Array.isArray(images)) {
          return false;
        }
        for(var i = 0; i < images.length; i++) {
          if(images[i].course_image_id == courseImage.id) {
            return true;
          }
        }
        return false;
      };

      ctrl.addToCollection = function(courseImage) {
        $log.log("addToCollection", courseImage);
        ctrl.onAddImage({ courseImage: courseImage });
      };

      ctrl.goToImageView = function(courseImage) {
        $log.log('goToImageView', courseImage);
        $location.path('/image/' + courseImage.id);
      };

      ctrl.onClickSubmitWebImage = function() {
        var $container = angular.element(".library-source-web");
        var $btn = angular.element("#webimage-btn");
        var data = {
          "id": AppConfig.course_id,
          "url": ctrl.webimage.url,
          "title": ctrl.webimage.title
        };

        $log.log("submitting web image", ctrl.webimage, data);

        var reset = function() {
          ctrl.webimage.url = "";
          ctrl.webimage.title = "";
        };
        var mask = function() {
          $container.addClass("mask");
          $btn.attr("disabled", "disabled");
        };
        var unmask = function() {
          $btn.removeAttr("disabled");
          $container.removeClass("mask");
        };

        mask();
        Course.addWebImage(data, function(results) {
          $log.log("submitted web image:", results);
          ctrl.notifications.clear().success("Image added successfully", "library");
          results.forEach(function(resource) {
            CourseCache.addImage(resource);
          });
          reset();
          unmask();
        }, function(httpResponse) {
          console.error(httpResponse);
          var error = "Failed to add image.";
          if(httpResponse.data && "detail" in httpResponse.data) {
            error += "\n\n";
            error += httpResponse.data.detail;
          }
          ctrl.notifications.clear().error(error, "library");
          unmask();
        });
      };

      // Initialize
      ctrl.sortLibrary(ctrl.sortChoices[0]);

      $scope.$on('$dropletReady', Droplet.onReady);
      $scope.$on('$dropletError', Droplet.onError(function(event, response) {
        Notifications.clear().error(response, "library");
      }));
      $scope.$on('$dropletFileAdded', Droplet.onFileAdded(function(event, model) {
        FILE_STATS.filesToUpload = Droplet.getTotalValid();
        FILE_STATS.fileUploadSize = Droplet.getUploadSizeMB();
        Notifications.clear();
      }, function(event, model, msg) {
        FILE_STATS.filesToUpload = Droplet.getTotalValid();
        FILE_STATS.fileUploadSize = Droplet.getUploadSizeMB();
        Notifications.clear().warn(msg, "library");
      }));
      $scope.$on('$dropletFileDeleted', Droplet.onFileDeleted(function() {
        FILE_STATS.filesToUpload = Droplet.getTotalValid();
        FILE_STATS.fileUploadSize = Droplet.getUploadSizeMB();
      }));
      $scope.$on('$dropletSuccess', Droplet.onSuccess(function(event, response, files) {
        if (angular.isArray(response)) {
          for(var i = 0; i < response.length; i++) {
            CourseCache.addImage(response[i]);
          }
        } else {
          CourseCache.addImage(response);
        }
        FILE_STATS.filesToUpload = Droplet.getTotalValid();
        FILE_STATS.fileUploadSize = Droplet.getUploadSizeMB();
        Notifications.clear().success("Images uploaded successfully", "library");
      }));

      $scope.$watch('$ctrl.layout', function(newVal, oldVal) {
        Preferences.set(Preferences.UI_WORKSPACE_LAYOUT, newVal);
      });

      $scope.$watchCollection('$ctrl.collectionImages', function(newCol, oldCol) {
        $log.log("collection images changed");
      });

      $log.log("collectionEditLibrary", ctrl);
    }],
    controllerAs: '$ctrl',
    templateUrl: '/static/app/templates/collectionEditLibrary.html'
  };
}]);