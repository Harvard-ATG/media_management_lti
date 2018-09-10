angular.module('media_manager')
.component('appCollectionEditLibrary', {
  templateUrl: '/static/app/templates/collectionEditLibrary.html',
  bindings: {
    onAddImage: '&',
    selectedImages: '<'
  },
  controller: ['$scope', '$location', '$log', 'AppConfig', 'Course', 'CourseCache', 'Droplet', 'Notifications', 'Preferences', function ($scope, $location, $log, AppConfig, Course, CourseCache, Droplet, Notifications, Preferences) {
    var ctrl = this;
    var LOOKUP_SELECTED = {};

    ctrl.filterByTitle = function(query) {
      if(!query) {
        return function() { return true; };
      }
      query = query.trim().toLowerCase();
      return function(obj) {
        var title = obj.title.toLowerCase();
        return title.indexOf(query) !== -1;
      };
    };

    ctrl.filterImages = function(query) {
      var valid_query = (typeof query === "string" && query.trim().length > 0);
      if(valid_query) {
        ctrl.filteredCourseImages = ctrl.courseImages.filter(ctrl.filterByTitle(query));
      } else {
        ctrl.filteredCourseImages = ctrl.courseImages.slice(0);
      }
    };

    ctrl.resetFilter = function() {
      ctrl.imagequery = '';
      ctrl.filterImages(null);
    };

    ctrl.getCourseImages = function() {
      var images =  CourseCache.images || [];
      return images.filter(ctrl.courseImageHasUrl);
    };

    ctrl.updateSelectedImages = function(selectedImages) {
      LOOKUP_SELECTED = {};
      if(!Array.isArray(selectedImages)) {
        selectedImages = [];
      }
      for(var i = 0; i < selectedImages.length; i++) {
        LOOKUP_SELECTED[selectedImages[i]] = true;
      }
      ctrl.selectedImages = selectedImages.slice(0);
    };

    ctrl.updateCourseImages = function() {
      ctrl.courseImages = ctrl.getCourseImages(); // break old reference so component detects the change
      ctrl.filterImages(ctrl.imagequery);
    };

    ctrl.updateLayout = function(layout) {
      ctrl.isLayoutGallery = (layout === "gallery");
      ctrl.isLayoutList = (layout === "list");
      Preferences.set(Preferences.UI_WORKSPACE_LAYOUT, layout);
    };

    ctrl.setLayoutGallery = function() {
      ctrl.updateLayout("gallery");
    };

    ctrl.setLayoutList = function() {
      ctrl.updateLayout("list");
    };

    ctrl.sortLibrary = function (choice) {
      CourseCache.updateSort(choice.name, choice.dir).sortImages();
      ctrl.updateCourseImages();
    };

    ctrl.onClickSortLibrary = function ($event, choice) {
      $event.preventDefault();
      ctrl.sortLibrary(choice);
    };

    ctrl.courseImageHasUrl = function (value, index, array) {
      return value.image_url != "";
    };

    ctrl.inCollection = function (courseImage) {
      return ctrl.checkCourseImageInCollection(courseImage);
    };

    ctrl.checkCourseImageInCollection = function (courseImage) {
      return LOOKUP_SELECTED[courseImage.id];
    };

    ctrl.addToCollection = function (courseImage) {
      $log.log("addToCollection", courseImage);
      ctrl.onAddImage({'$event': courseImage});
    };

    ctrl.goToImageView = function (courseImage) {
      $log.log('goToImageView', courseImage);
      $location.path('/image/' + courseImage.id);
    };

    ctrl.onClickSubmitWebImage = function () {
      var $container = angular.element(".library-source-web");
      var $btn = angular.element("#webimage-btn");
      var data = {
        "id": AppConfig.course_id,
        "url": ctrl.webimage.url,
        "title": ctrl.webimage.title
      };

      $log.log("submitting web image", ctrl.webimage, data);

      var reset = function () {
        ctrl.webimage.url = "";
        ctrl.webimage.title = "";
      };
      var mask = function () {
        $container.addClass("mask");
        $btn.attr("disabled", "disabled");
      };
      var unmask = function () {
        $btn.removeAttr("disabled");
        $container.removeClass("mask");
      };

      mask();
      Course.addWebImage(data, function (results) {
        $log.log("submitted web image:", results);
        ctrl.notifications.clear().success("Image added successfully", "library");
        results.forEach(function (resource) {
          CourseCache.addImage(resource);
        });
        reset();
        unmask();
      }, function (httpResponse) {
        console.error(httpResponse);
        var error = "Failed to add image.";
        if (httpResponse.data && "detail" in httpResponse.data) {
          error += "\n\n";
          error += httpResponse.data.detail;
        }
        ctrl.notifications.clear().error(error, "library");
        unmask();
      });
    };

    // Component Lifecycle
    ctrl.$onInit = function() {
      ctrl.notifications = Notifications;
      ctrl.Droplet = Droplet;
      ctrl.fileStats = {filesToUpload: 0, fileUploadSize: 0};
      ctrl.webimage = {title: "", url:""};
      ctrl.sortChoices = [
        {'label': 'Default Order', 'name': 'sort_order', 'dir': 'asc'},
        {'label': 'Newest to Oldest', 'name': 'created', 'dir': 'desc'},
        {'label': 'Oldest to Newest', 'name': 'created', 'dir': 'asc'},
        {'label': 'Title', 'name': 'title', 'dir': 'asc'},
      ];

      ctrl.courseImages = ctrl.getCourseImages();
      ctrl.filteredCourseImages = ctrl.courseImages;
      ctrl.sortLibrary(ctrl.sortChoices[1]);
      ctrl.updateLayout(Preferences.get(Preferences.UI_WORKSPACE_LAYOUT));

      $log.log("initialized collectionEditLibrary", ctrl);
    };

    ctrl.$onChanges = function(changes) {
      $log.log("appCollectionEditLibrary detected changes", changes);

      if(changes.hasOwnProperty('selectedImages')) {
        ctrl.updateSelectedImages(changes.selectedImages.currentValue);
        ctrl.updateCourseImages();
      }
    };


    // Listen for droplet events related to image/file upload
    $scope.$on('$dropletReady', Droplet.onReady);
    $scope.$on('$dropletError', Droplet.onError(function (event, response) {
      Notifications.clear().error(response, "library");
    }));
    $scope.$on('$dropletFileAdded', Droplet.onFileAdded(function (event, model) {
      ctrl.fileStats.filesToUpload = Droplet.getTotalValid();
      ctrl.fileStats.fileUploadSize = Droplet.getUploadSizeMB();
      Notifications.clear();
    }, function (event, model, msg) {
      ctrl.fileStats.filesToUpload = Droplet.getTotalValid();
      ctrl.fileStats.fileUploadSize = Droplet.getUploadSizeMB();
      Notifications.clear().warn(msg, "library");
    }));
    $scope.$on('$dropletFileDeleted', Droplet.onFileDeleted(function () {
      ctrl.fileStats.filesToUpload = Droplet.getTotalValid();
      ctrl.fileStats.fileUploadSize = Droplet.getUploadSizeMB();
    }));
    $scope.$on('$dropletSuccess', Droplet.onSuccess(function (event, response, files) {
      if (angular.isArray(response)) {
        for (var i = 0; i < response.length; i++) {
          CourseCache.addImage(response[i]);
        }
      } else {
        CourseCache.addImage(response);
      }
      ctrl.fileStats.filesToUpload = Droplet.getTotalValid();
      ctrl.fileStats.fileUploadSize = Droplet.getUploadSizeMB();
      ctrl.updateCourseImages();
      Notifications.clear().success("Images uploaded successfully", "library");
    }));

  }]
});