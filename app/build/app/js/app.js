angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource', 'angularSpinner', 'as.sortable', 'ngAnimate'])
.run(function(editableOptions){
  editableOptions.theme = 'bs3';
})
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $locationProvider.hashPrefix('!');
  $routeProvider
  .when('/', {
    redirectTo: function() {
      console.log("Index redirecting to: ", window.appConfig.angular_route);
      return window.appConfig.angular_route;
    }
  })
  .when('/workspace', {
    templateUrl: "/static/app/templates/controllers/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/workspace/:collectionId', {
    templateUrl: "/static/app/templates/controllers/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "/static/app/templates/controllers/collections.html",
    controller: 'CollectionsController',
    controllerAs: 'lc'
  })
  .when('/settings', {
    templateUrl: "/static/app/templates/controllers/settings.html",
    controller: "SettingsController",
    controllerAs: 'sc',
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/controllers/mirador.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/controllers/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  })
  .when('/error/:errorCode', {
    templateUrl: "/static/app/templates/controllers/error.html",
    controller: 'ErrorController',
    controllerAs: 'er'
  })
}])
.config(['$logProvider', function($logProvider) {
  var debugEnabled = true;
  console.log("debugEnabled:", debugEnabled);
  $logProvider.debugEnabled(debugEnabled);
}])
.filter("asDate", function () {
    return function (input) {
        return new Date(input);
    }
})
.filter('ellipsit', [function(){
  return function(input, length){
    input = input || '';
    length = parseInt(length) || 20;
    var out = input.substr(0, length);
    if(out.length < input.length){
      out += "...";
    }
    return out;
  };
}])
.filter('newlines', [function(){
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  };
}])
.filter('rawhtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])
.filter('nohtml', function () {
    return function(text) {
        return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
    }
})
;

angular.module('media_manager').component('breadcrumbs', {
  templateUrl: '/static/app/templates/components/breadcrumbs.html',
  bindings: {},
  controller: ['Breadcrumbs', function(Breadcrumbs) {
    this.crumbs = Breadcrumbs.crumbs;
  }]
});

angular.module('media_manager').component('appButtonConfirmDelete', {
  templateUrl: '/static/app/templates/components/buttonConfirmDelete.html',
  bindings: {
    onConfirm: '&',
    onCancel: '&',
    msg: '@',
    buttonText: '@',
    buttonTextOk: '@',
    buttonTextCancel: '@',
  },
  controller: ['$log', function($log) {
    var ctrl = this;
    ctrl.showConfirm = false;
    ctrl.cancel = function() {
      $log.log("cancel");
      ctrl.showConfirm = false;
      ctrl.onCancel({'$event': 'cancel'});
    };
    ctrl.confirm = function() {
      $log.log("confirm");
      ctrl.showConfirm = false;
      ctrl.onConfirm({'$event': 'confirm'});
    };
    ctrl.$onInit = function() {
      if(!ctrl.buttonTextOk) {
        ctrl.buttonTextOk = "OK";
      }
      if(!ctrl.buttonTextCancel) {
        ctrl.buttonTextCancel = "Cancel";
      }
      $log.log("init confirm");
    };
  }]
});

angular.module("media_manager").component("appCollectionEdit",  {
    templateUrl: "/static/app/templates/components/collectionEdit.html",
    bindings: {
      "collectionId": "<"
    },
    controller: ["$log", "$location", "AppConfig", "CourseCache", "Notifications", "Collection", function($log, $location, AppConfig, CourseCache, Notifications, Collection) {
      var ctrl = this;

      ctrl.setLoading = function(key, inProgress, msg) {
        $log.debug("setLoading", key, inProgress, msg);
        if(!ctrl.loadingState.hasOwnProperty(key)) {
          ctrl.loadingState[key] = {status: false, msg: ""};
        }
        ctrl.loadingState[key].status = inProgress;
        ctrl.loadingState[key].msg = msg || "";
        if(inProgress) {
          ctrl.loadingCount++;
        } else {
          ctrl.loadingCount--;
        }
        ctrl.isLoading = ctrl.loadingCount > 0;
      };

      ctrl.getLoadingState = function(key) {
        return ctrl.loadingState[key] || {};
      };

      ctrl.setContentSource = function(source) {
        if(["images","custom"].indexOf(source) < 0) {
          throw new Error("invalid content source: "+source);
        }
        ctrl.contentSource = source;
        ctrl.isContentImages = (source === "images");
        ctrl.isContentManifest = (source === "custom");
      };

      ctrl.setContentToImages = function() {
        $log.debug("setContentToImages");
        ctrl.setContentSource('images');
        ctrl.collection.iiif_source = "images";
        ctrl.saveCollection('Collection will use your images');
      };
      ctrl.setContentToManifest = function() {
        $log.debug("setContentToManifest");
        ctrl.setContentSource('custom');
        ctrl.collection.iiif_source = "custom";
        ctrl.saveCollection('Collection will use the IIIF manifest');
      };

      ctrl.getCollection = function(collectionId) {
        $log.debug("getCollection", collectionId);
        if(!collectionId) {
          throw new Error("Invalid collectionId passed to getCollection()")
        }
        ctrl.setLoading("loadcollection", true, "Loading collection...");
        var collection = Collection.get({id: collectionId});
        collection.$promise.then(function(collection) {
          collection.images.sort(function(a, b){
            var x = a['sort_order'];
            var y = b['sort_order'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
          ctrl.setContentSource(collection.iiif_source);
          ctrl.setLoading("loadcollection", false);
        });
        return collection;
      };

      ctrl.saveCollection = function(message){
        return ctrl.updateCollection(message);
      };

      ctrl.updateCollection = function(message) {
        message = message || "Collection saved.";
        var collectionId = ctrl.collection.id;
        $log.log("updateCollection", collectionId, message);

        ctrl.collection.course_image_ids = ctrl.collection.images.map(function(image) {
          // images could come from the image library, or already be part of the collection
          // and we want to make sure we're returning the image "id" property, not the collectionimage "id"
          var image_prop_for = {
            "collectionimages": "course_image_id",
            "images": "id"
          };
          return image[image_prop_for[image.type]];
        });

        ctrl.setLoading("savecollection", true, "Saving collection...");

        return Collection.update({}, ctrl.collection, function(data){
          ctrl.notifications.clear();
          ctrl.collection = angular.copy(ctrl.collection);
          CourseCache.updateCollection(ctrl.collection);
        }, function(errorResponse) {
          $log.error("Failed to update collection:", errorResponse);
          ctrl.notifications.error("Failed to update collection.");
        }).$promise.then(function(data) {
          $log.log("Collection successfully updated: ", data);
          ctrl.notifications.success(message);
        }).finally(function() {
          ctrl.setLoading("savecollection", false);
        });
      };

      ctrl.addCourseImageToCollection = function(courseImage){
        $log.debug("addCollectionImage", courseImage);
        ctrl.collection.images.push(courseImage);
        ctrl.collection.images = ctrl.collection.images.slice(0); // break old reference so child component gets change
        ctrl.saveCollection("Image added to collection: " + courseImage.title);
      };

      ctrl.removeCollectionImage = function(collectionImage){
        $log.debug("removeCollectionImage", collectionImage);

        // note this needs to be a forEach/search instead of a splice because
        // ng-sortable won't work with "track by $index" enabled on the ng-repeat
        // https://github.com/a5hik/ng-sortable/issues/221
        ctrl.collection.images.some(function(item, index, arr){
          if(item.id == collectionImage.id){
            ctrl.collection.images.splice(index, 1);
            ctrl.collection.images = ctrl.collection.images.slice(0); // break old reference so child component gets change
            ctrl.saveCollection("Image removed from collection: " + item.title);
            return true;
          }
        });
      };

      ctrl.updateCollectionOrder = function(reorderedImages) {
        $log.debug("updateCollectionOrder", reorderedImages);
        ctrl.collection.images = reorderedImages.slice(0);
        ctrl.saveCollection("Collection order saved");
      };

      ctrl.updateManifest = function(data) {
        $log.log("updateManifest", data);

        ctrl.collection.iiif_custom_manifest_url = (data.manifestUrl || "").trim();
        ctrl.collection.iiif_custom_canvas_id = (data.canvasId || "").trim();

        ctrl.saveCollection();
      };

      ctrl.handleManifestError = function(hasError) {
        ctrl.isManifestUrlValid = !hasError ;
      };

      ctrl.updateCollectionInfo = function() {
        var title = ctrl.collection.title.trim();
        if(title !== "") {
          ctrl.saveCollection("Saved collection information");
        }
      };

      ctrl.cancelCollection = function() {
        $location.path('/collections/');
      };

      ctrl.openCollection = function() {
        $location.path('/mirador/' + ctrl.collectionId);
      };

      ctrl.canOpenCollection = function() {
        var result = false;
        if(ctrl.isContentImages) {
          result = ctrl.isManifestUrlValid && ctrl.collection.images.length > 0;
        } else if(ctrl.isContentManifest) {
           result = ctrl.isManifestUrlValid && ctrl.collection.iiif_custom_manifest_url;
        }
        return result;
      };

      // Component Lifecycle
      ctrl.$onInit = function() {
        ctrl.initialized = false;
        ctrl.notifications = Notifications;
        ctrl.courseImages  = CourseCache.images;
        ctrl.courseCollections  = CourseCache.collections;
        ctrl.loadingCount = 0;
        ctrl.loadingState = {};
        ctrl.isLoading = false;
        ctrl.contentSource = null;
        ctrl.isContentImages = false;
        ctrl.isContentManifest = false;
        ctrl.isManifestUrlValid = true;

        var collection = ctrl.getCollection(ctrl.collectionId);
        collection.$promise.then(function() {
          ctrl.collection = collection; // wait to update controller scope until the collection is done loading
          ctrl.initialized = true;
          ctrl.setContentSource(ctrl.collection.iiif_source);
        }).catch(function() {
          ctrl.notifications.error("Error loading collection: " + ctrl.collectionId);
        });

        $log.debug("initialized collectionEdit", ctrl);
      };

    }]
});

angular.module('media_manager')
.component('appCollectionEditImages', {
  templateUrl: '/static/app/templates/components/collectionEditImages.html',
  bindings: {
    images: "<",
    isLoading: "<",
    iiifUrl: "<",
    onRemoveImage: "&",
    onChangeOrder: "&"
  },
  controller: ['$log', '$location', function($log, $location)  {
    var ctrl = this;
    var dragEnabled = true;

    ctrl.goToImageView = function(image) {
      $log.log('goToImageView', image);
      $location.path('/image/' + image.course_image_id);
    };

    ctrl.removeImage = function(image) {
      $log.log('removeImage', image);
      ctrl.onRemoveImage({ '$event': image });
    };

    ctrl.dragControlListeners = {
      accept: function(sourceItemHandleScope, destSortableScope){
        return dragEnabled;
      },
      orderChanged: function(event){
        dragEnabled = false;

        var updates = [];
        ctrl.images.forEach(function(item, index, arr){
          var newsort = index + 1;
          ctrl.images[index].sort_order = newsort;
        });
        dragEnabled = true;

        ctrl.onChangeOrder({ '$event': ctrl.images });
      }
    };

    ctrl.toggleIiifUrl = function() {
      ctrl.showIiifUrl = !ctrl.showIiifUrl;
    };

    // Component Lifecycle
    ctrl.$onInit = function() {
      ctrl.images = angular.copy(ctrl.images); // ensure we get our own copy
      $log.log("initialized collectionEditImages", ctrl);
    };

    ctrl.$onChanges = function(changes) {
      console.log("appCollectionEditImages detected changes", changes);
      if(changes.hasOwnProperty('isLoading')) {
        ctrl.isLoading = changes.isLoading.currentValue;
      }
      if(changes.hasOwnProperty('images')) {
        ctrl.images = angular.copy(changes.images.currentValue);
      }
      if(changes.hasOwnProperty('iiifUrl')) {
        ctrl.iiifUrl = changes.iiifUrl.currentValue;
      }
    };

  }]
});

angular.module('media_manager')
.component('appCollectionEditLibrary', {
  templateUrl: '/static/app/templates/components/collectionEditLibrary.html',
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

angular.module('media_manager')
.component('appCollectionEditManifest', {
  templateUrl: '/static/app/templates/components/collectionEditManifest.html',
  bindings: {
    collection: '<',
    onChange: '&',
    onOpen: '&',
    onError: '&'
  },
  controller: ['$log', function($log) {
    var ctrl = this;

    ctrl.validateManifest = function() {
      ctrl.hasError = false;
      ctrl.errorMsg = "";
      var isEmpty = ctrl.manifestUrl.trim() === "";
      var isHttps = /^https:\/\/[^/]+/.test(ctrl.manifestUrl);
      if(!isEmpty && !isHttps) {
        ctrl.errorMsg = "The manifest URL must start with https://";
        ctrl.hasError = true;
      }
      ctrl.preview();
      ctrl.onError({ '$event': ctrl.hasError });
    };

    ctrl.selectManifest = function() {
      ctrl.canvasId = "";
      ctrl.update();
    };

    ctrl.selectCanvas = function(canvasId) {
      ctrl.canvasId = canvasId;
      ctrl.update();
    };

    ctrl.update = function() {
      ctrl.save();
      ctrl.preview();
    };

    ctrl.save = function() {
      var data = {"manifestUrl": ctrl.manifestUrl, "canvasId": ctrl.canvasId};
      ctrl.onChange({ '$event': data });
    };

    ctrl.preview = function() {
      ctrl.previewEnabled = (ctrl.manifestUrl !== "" && !ctrl.hasError);
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.$onInit = function() {
      ctrl.previewEnabled = false;
      ctrl.hasError = false;
      ctrl.errorMsg = "";
      ctrl.manifestUrl = ctrl.collection.iiif_custom_manifest_url;
      ctrl.canvasId = ctrl.collection.iiif_custom_canvas_id;
      ctrl.preview();
    };

    ctrl.$onChanges = function(changes) {
      $log.log("collectionEditManifest changes", changes);
      var change;
      if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
        change = changes.collection;
        ctrl.manifestUrl = change.currentValue.iiif_custom_manifest_url;
        ctrl.canvasId = change.currentValue.iiif_custom_canvas_id;
        ctrl.preview();
      }
    };
  }]
});

angular.module('media_manager').component('appImageLibraryGallery', {
  templateUrl: '/static/app/templates/components/imageLibraryGallery.html',
  bindings: {
    courseImages: "<",
    onAddToCollection: "&",
    onInCollection: "&",
  },
  controller: ['$log', '$location', function($log, $location) {
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
      $log.log("imageLibraryGalleryChanges", changes);
      if(changes.hasOwnProperty('courseImages') && !changes.courseImages.isFirstChange()) {
        ctrl.courseImages = changes.courseImages.currentValue;
      }
    };
  }]
});

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

angular.module('media_manager')
.component('appManifestPreview', {
  templateUrl: '/static/app/templates/components/manifestPreview.html',
  bindings: {
    manifestUrl: '<',
    canvasId: '<',
    onSelectCanvas: '&'
  },
  controller: ['$log', '$http', '$window', function($log, $http, $window) {
    var ctrl = this;

    ctrl.validIiifManifest = function(manifest) {
      var m = manifest;
      if(!m.hasOwnProperty('@id') || !m.hasOwnProperty('@context') || !m.hasOwnProperty('label')) {
        return false;
      }
      if(!m.hasOwnProperty('sequences') || m.sequences.length < 1 || !m.sequences[0].hasOwnProperty('canvases')) {
        return false;
      }
      return true;
    };

    ctrl.validIiifCanvas = function(canvas) {
      if(!canvas.hasOwnProperty('images') || canvas.images.length < 1 || !canvas.images[0].hasOwnProperty('resource') || !canvas.images[0].resource.hasOwnProperty('service')) {
        return false;
      }
      return true;
    };

    ctrl.processCanvases = function(manifest, selectedCanvasId) {
      var canvases = manifest.sequences[0].canvases;
      return canvases.map(function(canvas, index) {
        if(!ctrl.validIiifCanvas(canvas)) {
          return false;
        }
        var iiif_base_uri = canvas.images[0].resource.service['@id'];
        if(!iiif_base_uri) {
          return false;
        }

        var image = {};
        image.thumbUrl  = iiif_base_uri + '/full/100,/0/default.jpg';
        image.largeUrl  = iiif_base_uri + '/full/pct:50/0/default.jpg';
        image.canvasId  = canvas['@id'];
        image.label     = canvas.label || 'Canvas #' + index;
        image.selected  = (selectedCanvasId && selectedCanvasId === canvas['@id']) ? true : false;

        return image;
      }).filter(function(image) {
        return image !== false;
      });
    };

    ctrl.handleManifestSuccess = function(response) {
      $log.log("handleManifestSuccess", response);

      var contentType = response.headers('Content-Type');
      if(contentType.indexOf('json') === -1) {
        return ctrl.reportError('invalidContentType', contentType);
      }
      if(!ctrl.validIiifManifest(response.data)) {
        return ctrl.reportError('invalidManifestJson');
      }

      ctrl.manifest = response.data;
      ctrl.pageEnd = ctrl.pageSize;
      ctrl.images = ctrl.processCanvases(ctrl.manifest, ctrl.canvasId);
      ctrl.displayCurrentImages();

      return true;
    };

    ctrl.handleManifestError  = function(err) {
      if(err.status <= 0) {
        ctrl.reportError('httpNotAvailableError');
      } else {
        ctrl.reportError('httpResponseError', err);
      }
      return false;
    };

    ctrl.reportError = function(code, err) {
      $log.log("reportError", code, err);
      ctrl.hasError = true;
      switch(code) {
        case 'invalidContentType':
          var contentType = err;
          ctrl.errorMsg = "The content type is not valid [" + contentType + "]. Expected a JSON document.";
          break;
        case 'invalidManifestJson':
          ctrl.errorMsg = 'The JSON document does not appear to be a IIIF-compliant manifest as described by http://iiif.io/api/presentation/2.1/#manifest';
          break;
        case 'httpResponseError':
          ctrl.errorMsg = "The HTTP request failed to load manifest for preview. " + (err.statusText ? 'Status: ' + err.statusText : '');
          break;
        case 'httpNotAvailableError':
          ctrl.errorMsg = "The HTTP request failed. Timed out or missing/misconfigured CORS HTTP headers.";
          break;
        default:
          ctrl.errorMsg = "Failed to load manifest. Reason unknown.";
          break;
      }
      return false;
    };

    ctrl.fetchManifest = function(url) {
      $log.log("fetchManifest", url);

      var config = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/ld+json'
        },
        cache: true,
        timeout: 5000
      };

      ctrl.resetErrors();
      ctrl.isLoading = true;
      $http.get(url, config)
        .then(ctrl.handleManifestSuccess, ctrl.handleManifestError)
        .then(ctrl.resetLoading, ctrl.resetLoading)
        .then(null, ctrl.resetImages);
    };

    ctrl.selectCanvas = function(image) {
      if(image.canvasId == ctrl.canvasId) {
        ctrl.onSelectCanvas({ '$event': '' });
      } else {
        ctrl.onSelectCanvas({ '$event': image.canvasId });
      }
    };

    ctrl.openLargeImage = function(image) {
      $window.open(image.largeUrl, image.label, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
    };

    ctrl.displayNextImages = function(pageSize) {
      if(typeof pageSize == 'number' && pageSize >= 0) {
        ctrl.pageSize = pageSize;
      }
      ctrl.pageEnd += ctrl.pageSize;
      ctrl.displayCurrentImages();
    };

    ctrl.displayCurrentImages = function() {
      var start = 0;
      var end = ctrl.pageEnd;
      if(end > ctrl.images.length) {
        end = ctrl.images.length;
      }
      ctrl.displayImages = ctrl.images.slice(start, end);
      ctrl.hasNextImages = (ctrl.images.length > ctrl.displayImages.length);
      ctrl.pageEnd = end;
    };

    ctrl.displayAllImages = function() {
      ctrl.pageEnd = ctrl.images.length;
      ctrl.displayCurrentImages();
    };

    ctrl.resetErrors = function() {
      ctrl.hasError = false;
      ctrl.error = "";
      return ctrl;
    };

    ctrl.resetLoading = function() {
      ctrl.isLoading = false;
      return ctrl;
    };

    ctrl.resetImages = function() {
      ctrl.images = [];
      ctrl.pageEnd = ctrl.pageSize;
      ctrl.displayCurrentImages();
    };

    ctrl.$onInit = function() {
      ctrl.hasError = false;
      ctrl.error = "";
      ctrl.images = null;
      ctrl.manifest = null;
      ctrl.displayImages = null;
      ctrl.pageSize = 10;
      ctrl.pageEnd = ctrl.pageSize;
      ctrl.isLoading = false;
      ctrl.fetchManifest(ctrl.manifestUrl);
    };

    ctrl.$onChanges = function(changes) {
      $log.log("manifestPreviewChanges", changes);
      if(changes.hasOwnProperty('manifestUrl') && !changes.manifestUrl.isFirstChange()) {
        ctrl.manifestUrl = changes.manifestUrl.currentValue;
        ctrl.fetchManifest(ctrl.manifestUrl);
      }
      if(changes.hasOwnProperty('canvasId') && !changes.canvasId.isFirstChange()) {
        ctrl.canvasId = changes.canvasId.currentValue;
        ctrl.images = ctrl.processCanvases(ctrl.manifest, ctrl.canvasId);
        ctrl.displayCurrentImages();
      }
    };
  }]
});

angular.module('media_manager').component('notifications', {
  templateUrl: '/static/app/templates/components/notifications.html',
  bindings: {
    "topic": "<"
  },
  controller: ['Notifications', function(Notifications) {
    var ctrl = this;

    ctrl.getMessages = function() {
      var messages = Notifications.messages.filter(function(message) {
        return message.topic == ctrl.topic;
      });
      return messages;
    };

    ctrl.close = function(message) {
      Notifications.delete(message);
    };

    ctrl.$onInit = function() {
      if(!ctrl.topic) {
        ctrl.topic = Notifications.DEFAULT_TOPIC;
      }
    };

    ctrl.$onChanges = function(changes) {
      console.log('notifications changes', changes);
    };

  }]
});

angular.module('media_manager').component('appSettings', {
  templateUrl: '/static/app/templates/components/settings.html',
  bindings: {},
  controller: ['AppConfig', 'Course', 'CourseCache', 'Notifications', '$q', '$uibModal', function(AppConfig, Course, CourseCache, Notifications, $q, $uibModal) {
    var ctrl = this;
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
      promise.then(function(response) {
        ctrl.courseCopyList = [];
      });
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

    ctrl.exportCourseImages = function() {
      // Helper function to trigger a file download using magic of object URLs.
      // See also: https://javascript.info/blob#blob-as-url
      function triggerDownload(csvdata) {
        var blob = new Blob([csvdata], {type: 'text/csv'});
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.style.display = "hidden";
        a.href = url;
        a.download = 'export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }

      // Submit authorized request for CSV export and then trigger download.
      var course = Course.exportCourseImages({ id: AppConfig.course_id });
      return course.$promise.then(function(response) {
        var csvdata = response.join("\n");
        triggerDownload(csvdata);
      });
    };

    ctrl.$onInit = function() {
      ctrl.course = Course.getCourse({ id: AppConfig.course_id });
      ctrl.courseCopyList = Course.getCourseCopies({ id: AppConfig.course_id });
    };
  }]
});

angular.module('media_manager').controller('CollectionsController', [
    '$scope',
    'CourseCache',
    'CourseModuleService',
    'CollectionBehavior',
    'Collection',
    'AppConfig',
    'Breadcrumbs',
    'Notifications',
    'Collection',
    '$q',
    '$http',
    '$location',
    function(
    $scope,
    CourseCache,
    CourseModuleService,
    CollectionBehavior,
    Collection,
    AppConfig,
    Breadcrumbs,
    Notifications,
    Collection,
    $q,
    $http,
    $location) {
        var lc = this;

        CourseCache.load();
        Breadcrumbs.home();

        lc.CourseCache = CourseCache;
        lc.notifications = Notifications;
        lc.error = lc.CourseCache.error;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        lc.isPrimaryCollection = function(collection_id) {
          return CourseModuleService.isPrimary(collection_id);
        };

        lc.setPrimaryCollection = function(collection_id) {
          CourseModuleService.updateModuleCollection(collection_id).then(function successCallback(response) {
            lc.notifications.success("Successfully updated primary collection");
          }, function errorCallback(response) {
            lc.notifications.error("Failure. Primary collection not updated ("+response.status+")");
          });
        };

        lc.createCollection = function() {
          console.log("createCollection");
          var data = {
            course_id: AppConfig.course_id,
            title: "Untitled Collection"
          };
          Collection.save(data).$promise.then(function(collection) {
            lc.CourseCache.collections.push(collection);
            console.log("created new collection", collection);
            $location.path('/workspace/'+collection.id);
          });
        };

        lc.dragEnabled = true;
        lc.dragControlListeners = {
          accept: function (sourceItemHandleScope, destSortableScope) {
            return lc.dragEnabled;
          },
          orderChanged: function(event){
            console.log("orderChanged", event);
            var sort_order = [], promise;
            lc.dragEnabled = false;

            // update the sort_order attribute on each collection object
            lc.CourseCache.collections.forEach(function(item, index, arr) {
              item.sort_order = index + 1; // order is 1-based, not 0-based
              sort_order.push(item.id);
            });

            // persist the change (send to the server)
            promise = lc.CourseCache.updateCollectionOrder({"id": AppConfig.course_id, "sort_order": sort_order});
            promise.then(function() {
              lc.dragEnabled = true;
              lc.notifications.success("Successfully updated collection list.");
            }).catch(function(r) {
              lc.notifications.error("Failed to update collection list ("+r.status+")");
              console.log(r);
            });
          }
        };
    }
]);

angular.module('media_manager').controller('ErrorController', ['$scope', '$routeParams', function($scope, $routeParams) {
    var errorCodes = {
        1: "Your session has expired. Please re-launch the tool." // access token expired
    };
    var code = $routeParams.errorCode;
    var msg = (code in errorCodes) ? errorCodes[code] : null;

    $scope.errorCode = code;
    $scope.errorMsg = msg;
}]);

angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', '$window', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, $window, Image){
  var ic = this;

  Breadcrumbs.addCrumb("Edit Image");
  
  ic.ImageBehavior = ImageBehavior;
  ic.Image = Image;
  ic.CourseCache = CourseCache;
  ic.current_image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0; // initialize to zero, but should be updated to the corret value

  ic.defaultMetadataLabels = [
    'Date',
    'Type',
    'Format',
    'Source',
    'Repository',
    'Creator',
    'Dimensions'
  ];
  
  ic.initializeImageIndex = function() {
    var images = CourseCache.images;
    for(var index = 0, img = null, len = images.length; index < len; index++) {
      img = images[index];
      if(img.id == $routeParams.imageId){
        ic.index = index;
        ic.changeCurrentImage(ic.index);
        break;
      }
    }
  };

  ic.next = function($event){
    $event.preventDefault();
    if(ic.index + 1 < CourseCache.images.length){
      ic.index++;
      ic.changeCurrentImage(ic.index);
    }
  };

  ic.prev = function($event){
    $event.preventDefault();
    if(ic.index > 0){
      ic.index--;
      ic.changeCurrentImage(ic.index);
    }
  };

  ic.changeCurrentImage = function(index) {
    CourseCache.current_image = CourseCache.images[index];
    ic.current_image          = CourseCache.images[index];

    if(ic.current_image.image_width < 400) {
      ic.current_image_url = ic.current_image.iiif_base_url + '/full/full/0/default.jpg';
    } else {
      ic.current_image_url = ic.current_image.iiif_base_url + '/full/400,/0/default.jpg';
    }
  };

  ic.openFullImage = function(current_image) {
    var title = current_image.title || "Image ID: "+current_image.id;
    $window.open(current_image.iiif_base_url + '/full/full/0/default.jpg', title);
  };

  ic.save = function(){
    var image = ic.current_image;
    if (!image) {
      $log.error("error saving image -- not defined!")
      return false;
    }

    Image.update({}, image, function success(data){
      $log.debug("saved image", data);
    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });

    return true;
  };

  ic.deleteImage = function(){
    ic.ImageBehavior.deleteImageModal(ic.current_image.id).then(function(){
      if(ic.CourseCache.images.length == 0){
        $location.path(Breadcrumbs.crumbs[Breadcrumbs.crumbs.length - 2].route);
      } else {
        if(ic.index == ic.CourseCache.images.length){
          ic.index--;
        } else if(ic.index < 0){
          ic.index = 0;
        }
        ic.changeCurrentImage(ic.index);
      }
    });
  };

  ic.getDefaultMetadata = function() {
    return ic.defaultMetadataLabels.map(function(label) {
      return {'label': label, 'value': ''};
    });
  };

  ic.getImageMetadata = function() {
    var metadata = [];
    var image_metadata = ic.current_image.metadata;
    var default_metadata = ic.getDefaultMetadata();
    
    if (angular.isArray(image_metadata) && image_metadata.length > 0) {
      metadata = angular.copy(image_metadata);
    } else {
      metadata = default_metadata;
    }

    return metadata;
  };

  ic.metaForm = {
    data: [],
    visible: false,
    waiting: false,
    hasError: false,
    errorMsg: '',
    show: function() {
      this.visible = true;
      this.resetErrorState();
    },
    hide: function() {
      this.visible = false;
      this.resetErrorState();
    },
    cancel: function() {
      this.data = ic.getImageMetadata();
      this.hide();
    },
    save: function() {
      ic.metaForm.waiting = true;
      ic.current_image.metadata = this.data;
      Image.update({}, ic.current_image, function success(data){
        ic.metaForm.resetErrorState();
        ic.metaForm.waiting = false;
        ic.metaForm.hide();
        $log.debug("successfully updated image");
      }, function failure(errorResponse){
        ic.metaForm.resetErrorState();
        ic.metaForm.waiting = false;
        ic.metaForm.errorMsg = errorResponse;
        ic.metaForm.hasError = true;
        $log.debug("error updating image:", errorResponse);
      });
    },
    addRow: function() {
      this.data.push({ 'label': '', 'value': '' })
    },
    deleteRow: function(index) {
      this.data.splice(index, 1);
    },
    resetErrorState: function() {
      this.hasError = false;
      this.errorMsg = '';
    }
  };
  
  // Update the form metadata when the current image changes
  $scope.$watch(function() {
    return ic.CourseCache.current_image ? ic.CourseCache.current_image.id : null;
  }, function(newVal, oldVal) {
    if (newVal !== null) {
      ic.metaForm.resetErrorState();
      ic.metaForm.data = ic.getImageMetadata();
    }
  });
  
  // Update the current image index if/when the cache of images changes (i.e. loaded)
  $scope.$watch(function() {
    return ic.CourseCache.isLoadingImages.status;
  }, function(newVal, oldVal) {
    ic.initializeImageIndex();
  });

}]);

angular.module('media_manager').controller('MiradorController', [
    '$scope',
    '$routeParams',
    '$location',
    'AppConfig',
    'Breadcrumbs',
function(
    $scope,
    $routeParams,
    $location,
    AppConfig,
    Breadcrumbs
) {
    var mr = this;

    var miradorUrl = "/mirador/:collection_id?resource_link_id="+AppConfig.resource_link_id;
    miradorUrl = miradorUrl.replace(':collection_id', $routeParams.collectionId);

    mr.canRead = AppConfig.perms.read;
    mr.canEdit = AppConfig.perms.edit;
    mr.showBreadcrumbs = !AppConfig.module.enabled;
    mr.iframeSrc =  miradorUrl;
    mr.collection_id = $routeParams.collectionId;

    Breadcrumbs.home().addCrumb("Mirador", $location.url());
}]);

angular.module('media_manager').controller('SettingsController', [
  '$scope',
  '$routeParams',
  '$location',
  'AppConfig',
  'Breadcrumbs',
  'Notifications',
  function(
    $scope,
    $routeParams,
    $location,
    AppConfig,
    Breadcrumbs,
    Notifications
  ) {
  var sc = this;
  sc.canEdit = AppConfig.perms.edit;

  Breadcrumbs.home().addCrumb("Settings", $location.url());
  Notifications.clear();

}]);

angular.module('media_manager')
.controller('WorkspaceController', ['$location',
                                    '$routeParams',
                                    'Breadcrumbs',
                                    'Notifications',
                                    'AppConfig',
                                    'CourseCache',
                                    function(
                                      $location,
                                      $routeParams,
                                      Breadcrumbs,
                                      Notifications,
                                      AppConfig,
                                      CourseCache){


  var wc = this;
  wc.canEdit = AppConfig.perms.edit;
  wc.collectionId = $routeParams.collectionId;

  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());
  CourseCache.load();
  Notifications.clear();

}]);

angular.module('media_manager')
.directive('dropletPreviewZip', [function(){
  
  // This image data was created from scratch. Steps to re-create:
  //   1. create a 96x96 image in your favorite image editor
  //   2. convert the image to base64 (see https://www.base64-image.de/)
  //   3. create a valid data URI (see https://en.wikipedia.org/wiki/Data_URI_scheme)
  var zipImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAADaUlEQVR42u2br48aQRiGVyAQJxAIRMWJE0gEAkmKOHECcWkQCARNKtHNCcQJBAJxruaSGv6AihOXhiYnLylpmv5IEKRBIHrpNeES2tJmOx8XyLJlj51ll212nzd5E8jszma/Z2e+mcmMYRjGJ2UTh2KJ/fwHCkcmAAAAAAAAAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAAAAAgAA0H8CoKD8Uvmz8tSI9yZbef+x8ivlx0EDSCq/IOiO/q38XvlRUABeK88I9EZ/cwFBG8ATgu/aP5TfKif8BPCBwGr5i/IzPwH8IahaHil3/QRAUPV9EyqA/f39rby3t7dSXyqVWpbJb/vzEomE67rT6fSuIIQHYFvVarWV+prN5rJMfq8DrqPZbGb2+33z9PTUzGQyANg1AKsmk4lZLpejBeD8/FzL8jVadXR05BmABHTT866uruatwNoicrlcdADoOJvNzoO2kATIfo0OgOFw6Oq5EvDxeLy87/LyMn4ApP8djUbLIFxfX5vJZHInAMSlUmml5Uk9sQEgIxfpChaSr9EpIQYFQCzXL3R8fBwfAGdnZyt9cKFQcLw2SAC9Xs8x+UcWgLyoVfV6/cHrgwRgHQDEogXk83lzOp0uX1pawqZ7ggJwcHCw8iHI/0gDsCddaf6SC8IAIDNqaw6SAUCkR0ESaGt/KyDczkJ1AEgyLxaLjq5UKma73V4ZgoqkLNIArElXxv06E58gZ8KiRqMRrZnwpqRbrVa17g8KgHRBh4eH0VsLeijptlot7Tp0ANze3s6vcbJ8DBL0HayKhg/AnnQvLi5cJd1dDkMjC8CedAeDwdq1fAAEBMCedGXRzWtdANgy6dqXlwEQIAB70j05Odn6ZQDgMemuW9sHQIAA7F2PwJCA6Lrb7QLADwBeJaMnAHgAIBMcCd627nQ6/4BdlK1bs5eub1Fubz2xHYbG3Hd+ArgjoNpb1ft+AugTVO29oW0/AVSVfxJY1/5uPHxGwNMBjTfsknZ9PqDsIqdqA0grv1P+RZDXWuLyVbnoclDj6ZCenPp4atwf0KM13FtODn1Ufm7cn6MzggSA/BEAAAAAAAAAAAgAAEAAAAACAAAQAACAAAAABAAAIAAAAAEAAAgAAEAAAAACAACQ3wDGBhtrw/L4L9MAX9xP8r3XAAAAAElFTkSuQmCC';
  
  // This comes from ngDroplet.js, since the browser needs a valid value for the src attribute.
  var blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  return {
    scope: {
      model: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img src="' + blankImage + '" style="background-image: url({{imageData}})" class="droplet-preview" />',
    link: function link(scope) {
        scope.imageData = zipImage;
    }
  };
}]);

angular.module('media_manager')
.directive('dropletThumb', [function(){
  return {
    scope: {
      image: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img ng-src="{{ image.thumb_url || image.image_url }}" class="droplet-preview" />'
  };
}]);

angular.module('media_manager')
.directive('focus', ['$parse', '$timeout', function($parse, $timeout){
  return {
    link: function(scope, element, attrs){
      var model = $parse(attrs.focus);
      scope.$watch(model, function(value){
        if(value){
          $timeout(function(){
            element[0].focus();
          }, 100);
        }
      });
    }
  };
}]);

angular.module('media_manager')
.directive('progressbar', [function () {
    return {

        /**
         * @property restrict
         * @type {String}
         */
        restrict: 'A',

        /**
         * @property scope
         * @type {Object}
         */
        scope: {
            model: '=ngModel'
        },

        /**
         * @property ngModel
         * @type {String}
         */
        require: 'ngModel',

        /**
         * @method link
         * @param scope {Object}
         * @param element {Object}
         * @return {void}
         */
        link: function link(scope, element) {

            var progressBar = new ProgressBar.Path(element[0], {
                strokeWidth: 2
            });

            scope.$watch('model', function() {

                progressBar.animate(scope.model / 100, {
                    duration: 1000
                });

            });

            scope.$on('$dropletSuccess', function onSuccess() {
                progressBar.animate(0);
            });

            scope.$on('$dropletError', function onSuccess() {
                progressBar.animate(0);
            });

        }

    }

}]);

angular.module('media_manager')
.directive('resizableIframe', function () {

    var calculateHeight = function(element) {
        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var height = windowHeight - 150; 
        console.log("calculateheight >>", element, windowHeight, "returning", height);
        return height;
    };

    var resize = function(element) {
        var height = calculateHeight(element);
        if (height < 500) {
            height = 500;
        } else if (height > 1000) {
            height = 1000;
        }
        element.css('height', height + "px");
    };

    return {
        // This directive automatically resizes the iframe to fill the screen.
        link: function ($scope, element, attrs) {
            var onResize = function() {
                resize(element);
            };

            $(window).on('resize', onResize);
            
            $scope.$on('$destroy', function() {
                $(window).off('resize', onResize);
            });
            
            resize(element);
        }
    };
});
angular.module('media_manager')
.directive('webimage', function () {

  var isTiff = function(url) {
    return /\.tiff?\s*$/.test(url);
  };

  var setup = function(params) {
    var img = params.img, msg = params.msg;

    var onload = function(e) {
      msg.hide();
      img.show();
    };

    var onerror = function(e) {
      var errmsg = "", errcls = "";

      if(isTiff(img[0].src)) {
        errmsg = "Preview not available. Your browser does not support TIFF previews."
        errcls = "alert alert-warning";
      } else {
        errmsg = "Preview not available. An error occurred while loading the image. Please ensure that the URL is valid and that it is a supported image type.";
        errcls = "alert alert-danger";
      }

      msg[0].className = errcls;
      msg.html(errmsg).show()
      img.hide();
    };

    img.bind("load", onload);
    img.bind("error", onerror);

    var onDestroy = function() {
      img.unbind("load", onload);
      img.unbind("error", onerror);
    };

    return onDestroy;
  };

  return {
    restrict: 'E',
    replace: 'true',
    scope: {img: "="},
    template: [
      '<div class="webimage">',
        '<img ng-src="{{img.url}}" class="preview" alt="Image Preview"/>',
        '<div class="alert"></div>',
      '</div>'
    ].join(''),
    link: function ($scope, elem, attrs) {
      var onDestroy = setup({
        img: elem.find("img"),
        msg: elem.find("div")
      });
      $scope.$on('$destroy', onDestroy);
    }
  };
});

angular.module('media_manager').service('AppConfig', function() {
    this.config = window.appConfig || {};

    // Permissions granted to the currently logged-in user
    this.perms = this.config.permissions || {};

    // Application endpoint URLs for AJAX interactions
    this.endpoints = this.config.endpoints || {};

    // Module-mode configuration
    // This just means the application is configured as a "module" in Canvas
    // and may opt to show a specific collection first, rather than the list of collections
    this.module = this.config.module || {};

    // Related to the module-mode configuration.
    // Defines the initial route when the application first loads.
    this.angular_route = this.config.angular_route

    // Configuration related to the Media Management API
    this.config.media_management_api = this.config.media_management_api || {};
    this.course_id = this.config.media_management_api.course_id;
    this.access_token = this.config.media_management_api.access_token;
    this.media_management_api_url = this.config.media_management_api.root_endpoint;

    // This is an LTI parameter that is used to uniquely identify sessions,
    // since the same tool may be instantiated multiple times in a given course,
    // or across courses. This parameter must be included with every request as a
    // query parameter. Example:
    //
    //    http://localhost:8000/path/to/view?resource_link_id=2a8b2d3fa51ea413d19
    this.resource_link_id = this.config.resource_link_id;

    this.authorization_header = "Token " + this.access_token;
});

angular.module('media_manager').service('Breadcrumbs', function() {
    var default_crumbs = [{"text": "Course Collections", "route": "/collections"}];

    this.crumbs = [];

    this.addCrumb = function(text, route) {
        this.crumbs.push({"text": text, "route": route});
        return this;
    };
    this.popCrumb = function() {
        this.crumbs.pop();
        return this;
    };
    this.home = function() {
        this.crumbs = angular.copy(default_crumbs);
        return this;
    };

    this.home();
});

angular.module('media_manager')
.factory('Collection', ['$resource',  'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  return $resource(host + '/collections/:id', { id: '@id' }, {
      'get': {
        method: 'GET',
        headers: headers,
        url: host + '/collections/:id'
      },
      'update': {
        method: 'PUT',
        headers: headers,
        url: host + '/collections/:id'
      },
      'save': {
        method: 'POST',
        headers: headers,
        url: host + '/collections/:id'
      },
      'delete': {
        method: 'DELETE',
        headers: headers,
        url: host + '/collections/:id'
      },
      'saveImages': {
        method: 'POST',
        headers: headers,
        url: host + '/collections/:id/images',
        isArray: true
      }
    }
  );
}]);

angular.module('media_manager')
.service('CollectionBehavior', ['$q', '$log', 'Collection', 'CourseCache',  '$uibModal', function($q, $log, Collection, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteCollection = function(id) {
        var collection = new Collection({ id: id });
        return collection.$delete(function() {
            var remove_at_idx = -1;
            var collections = CourseCache.collections;
            for(var idx = 0; idx < collections.length; idx++) {
                if (collections[idx].id == id) {
                    remove_at_idx = idx;
                    break;
                }
            }
            if (remove_at_idx >= 0) {
                $log.debug("removing collection id ", id, " from cache at index", remove_at_idx);
                collections.splice(remove_at_idx, 1);
            }
        });
    };

    service.deleteCollectionModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/components/modalConfirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                var collection = CourseCache.getCollectionById(id);
                cd.confirm_msg = "Are you sure you want to delete collection " + collection.title + " (ID:" + collection.id + ")? ";
                cd.ok = function() {
                    var deletePromise = service.actuallyDeleteCollection(id);
                    deletePromise.then(function() {
                        deferredDelete.resolve("success");
                    }, function() {
                        deferredDelete.reject("error");
                    });
                    modalInstance.close();
                };
                cd.cancel = function() {
                    modalInstance.close();
                    deferred.reject("cancel")
                };
            }],
            controllerAs: 'cd',
            size: 'sm'
        });
        return deferredDelete.promise;
    };

}]);

angular.module('media_manager').factory('Course', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  var paramDefaults = {
    id: '@id',
    image_id: '@image_id',
    collection_id: '@collection_id'
  };

  return $resource(host + '/courses/:id', paramDefaults, {
      'getCourse': {
        method: 'GET',
        headers: headers,
        url: host + '/courses/:id'
      },
      'getCourses': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses',
      },
      'getImages': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/images'
      },
      'getCourseCopies': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/course_copy',
      },
      'getCollections': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/collections'
      },
      'updateCollectionOrder': {
        method: 'PUT',
        headers: headers,
        url: host + '/courses/:id/collections',
        transformRequest: function(data) {
          return JSON.stringify({"sort_order": data['sort_order']});
        }
      },
      'deleteCollections': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/collections'
      },
      'deleteImages': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/images'
      },
      'deleteCourseCopies': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/course_copy'
      },
      'copyCourse': {
        method: 'POST',
        headers: headers,
        url: host + '/courses/:id/course_copy',
        transformRequest: function(data) {
          return JSON.stringify({"copy_source_id": data['copy_source_id']});
        }
      },
      'searchCourses': {
        method: 'GET',
        headers: headers,
        url: host + '/courses/search',
        isArray: true
      },
      'exportCourseImages': {
        method: 'GET',
        headers: {
          'Authorization': headers.Authorization,
          'Accept': 'text/csv'
        },
        url: host + '/courses/:id/library_export',
        isArray: true,
        transformResponse: function(data, headersGetter, status) {
          return data.split("\n");
        }
      },
      'addWebImage': {
        method: 'POST',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/images',
        transformRequest: function(data) {
          var url = data["url"];
          var title = data["title"];
          var transformed = {
            "items": [{ "url": url, "title": title }]
          };
          return JSON.stringify(transformed);
        }
      }
    }
  );
}]);

angular.module('media_manager')
.service('CourseCache', ['Course', 'AppConfig', 'Image', function(Course, AppConfig, Image){
  this.images = [];
  this.collections = [];
  this.current_image = null;
  this.isLoadingCollections = {"status": false, "msg": "Loading collections..."};
  this.isLoadingImages = {"status": false, "msg": "Loading images..."};
  this.isLoading = {"status": false, "msg": "Loading..."};
  this.error = {"message": ""};
  this.loaded = false;
  this.compareImages = null;
  this.sortType = null;

  this.addImage = function(image_object) {
    this.images.push(image_object);
    this.sortImages();
  };
  this.removeImage = function(image_id) {
    var remove_at_idx = -1;
    for(var i = 0, images = this.images, len = this.images.length; i < len; i++) {
        if (images[i].id == image_id) {
            remove_at_idx = i;
            break;
        }
    }

    if (remove_at_idx >= 0) {
      this.images.splice(remove_at_idx, 1);
      this.current_image = this.getPrevImage(image_id);
      return true;
    }
    return false;
  };
  this.setLoadingStatus = function(params) {
    if(params.hasOwnProperty("images")) {
      this.isLoadingImages.status = !!params.images;
    }
    if(params.hasOwnProperty("collections")) {
      this.isLoadingCollections.status = !!params.collections;
    }
    this.isLoading.status = this.isLoadingImages.status || this.isLoadingCollections.status;
    return this;
  };
  this.setError = function(params) {
    this.error.message = params.message || '';
  };
  this.updateCollectionOrder = function(sort_order) {
    return Course.updateCollectionOrder(sort_order).$promise;
  };
  this.loadImages = function() {
    var self = this;
    this.setLoadingStatus({ images: true });
    this.images = Course.getImages({id: AppConfig.course_id});
    this.images.$promise.then(function(images) {
      self.sortImages();
      if (self.current_image === null) {
        self.current_image = images[0];
      }
      self.setLoadingStatus({ images: false });
    }).catch(function(r) {
      console.log("Error loading images", r);
      self.setLoadingStatus({ images: false });
    });
    return this.images.$promise;
  }.bind(this);
  this.loadCollections = function() {
    var self = this;
	  this.setLoadingStatus({ collections: true });
    this.collections = Course.getCollections({id: AppConfig.course_id});
    this.collections.$promise.then(function(collections) {
      self.setLoadingStatus({ collections: false });
    }).catch(function(reason) {
      console.log("Error loading collections", reason);
      self.setLoadingStatus({ collections: false });
    });
    return this.collections.$promise;
  }.bind(this);
  this.load = function(errorCallback) {
    var self = this;
    if (!this.loaded) {
      this.loadImages().then(this.loadCollections).then(function() {
        self.loaded = true;
      }).catch(function(r) {
        self.loaded = false;
        self.setLoadingStatus({ images: false, collections: false });
        self.setError({ message: "Error loading data (Http code: " + r.status + ")" });
        if(errorCallback) {
          errorCallback(self.error);
        }
      });
    }
  }.bind(this);
  this.reload = function() {
    this.loaded = false;
    this.load();
  }.bind(this);
  this.getCollectionById = function(id) {
    for (var i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) {
        return this.collections[i];
      }
    }
    return false;
  };
  this.updateCollection = function(collection) {
    var cached_collection = this.getCollectionById(collection.id);
    if(cached_collection) {
       angular.copy(collection, cached_collection);
    }
  };
  this.getImageById = function(id){
    var that = this;
    if(that.images.length === 0){
      that.current_image = Image.get({id: id});
      that.load(); // load the rest of the images if they haven't been already
    }
    this.images.forEach(function(item){
      if(item.id == id){
        that.current_image = item;
      }
    });
    return that.current_image;
  };
  this.getPrevImage = function(image_id){
    for(var i = 0; i < this.images.length; i++){
      if(this.images[i].id == image_id){
        if(i > 0){
          return this.images[i-1];
        } else {
          return this.images[0];
        }
      }
    }
    if(this.images.length > 0){
      return this.images[0];
    } else {
      return null;
    }
  };
  this.updateSort = function(sortType, sortDir) {
    var make_numeric_compare = function(prop, dir) {
      return function(a, b) {
        var a_num = Number(a[prop]);
        var b_num = Number(b[prop]);
        if (isNaN(a_num) || isNaN(b_num)) {
          return 0;
        }
        return dir ? a_num - b_num : b_num - a_num;
      };
    };
    var make_date_compare = function(prop, dir) {
      return function(a, b) {
        var a_date = Date.parse(a[prop]);
        var b_date = Date.parse(b[prop]);
        if (isNaN(a_date) || isNaN(b_date)) {
          return 0;
        }
        return dir ? a_date - b_date : b_date - a_date;
      };
    };
    var make_str_compare = function(prop, dir) {
      return function(a, b) {
        var a_str = a[prop].toLowerCase().trim();
        var b_str = b[prop].toLowerCase().trim();
        if (a_str == b_str) {
          return 0;
        }
        return dir ? (a_str < b_str ? -1 : 1) : (b_str < a_str ? -1 : 1);
      };
    };
    var lookup_sort = {
      "created": function(dir) {
        return make_date_compare("created", dir);
      },
      "updated": function(dir) {
        return make_date_compare("updated", dir);
      },
      "title": function(dir) {
        return make_str_compare("title", dir);
      },
      "sort_order": function(dir) {
        return make_numeric_compare("sort_order", dir);
      }
    };

    if (!lookup_sort.hasOwnProperty(sortType)) {
      throw "Invalid sort type: " + sortType;
    }
    if (sortDir != "asc" && sortDir != "desc") {
      throw "Invalid sort dir: " + sortDir;
    }

    this.sortType = sortType;
    this.compareImages = lookup_sort[sortType](sortDir == "asc" ? true : false);

    return this;
  };
  this.sortImages = function() {
    var compare = this.compareImages;
    if (compare) {
      this.images.sort(compare);
    }
  };
}]);

angular.module('media_manager')
.service('CourseModuleService', ['$http', 'AppConfig', function($http, AppConfig){
  var service = this;

  service.collection_id = AppConfig.module.collection_id;

  service.updateModuleCollection = function(collection_id) {
    var url = AppConfig.module.endpoint;
    var data = {"collection_id": collection_id};
    var config = {};
    return $http.post(url, data, config).then(function() {
      service.collection_id = collection_id;
    });
  };
  service.isPrimary = function(collection_id) {
    return service.collection_id == collection_id;
  };
}]);

angular.module('media_manager')
.service('Droplet', ['$timeout', '$log', '$q', 'AppConfig', function($timeout, $log, $q, AppConfig){
  var ds = this;
  var ONE_MEGABYTE = 1000000; // bytes
  var ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'zip', 'tif', 'tiff'];

  ds.interface = null;

  ds.requestHeaders = {
    'Accept': 'application/json',
    'Authorization': AppConfig.authorization_header
  };

  ds.limits = {
    uploadSize:  200 * ONE_MEGABYTE,
    zipSize:     200 * ONE_MEGABYTE,
    imageSize:    50 * ONE_MEGABYTE
  };

  ds.validators = [
    {
      "name": "valid_file_type",
      "fn": function(model, errors) {
          var msg;
          var is_valid = (model.type == ds.interface.FILE_TYPES.VALID);
          if (is_valid) {
            return true;
          } else {
            msg = "Invalid image: '" + model.file.name +"'. Cannot upload file with extension '" + model.extension + "'. File extension must be one of: " + ds.allowedExtensions.join(", ");
            errors.push(msg);
            $log.debug("validator:", this.name, "msg:", msg);
            return false;
          }
      }
    },
    {
      "name": "valid_file_size",
      "fn": function(model, errors) {
        var msg, max_size;
        var is_valid = ds.isValidFileSize(model.file);
        if (is_valid) {
          return true;
        } else {
          max_size = ds.isZipFile(model.file) ? ds.limits.zipSize : ds.limits.imageSize;
          msg = "File '" + model.file.name + "' (" + model.file.type + ") is too large. Limit " + ds.getSizeInMegabytes(max_size) + "MB.";
          errors.push(msg);
          $log.debug("validator:", this.name, "msg:", msg);
          return false;
        }
      }
    },
    {
      "name": "valid_upload_size",
      "fn": function(model, errors) {
        var msg;
        var is_valid = ds.isValidUploadSize();
        if (is_valid) {
          return true;
        } else {
          msg = "Total upload size is too large. Imported images cannot exceed " + ds.getSizeInMegabytes(ds.limits.uploadSize, 0) + "MB per upload.";
          errors.push(msg);
          $log.debug("validator:", this.name, "msg:", msg);
          return false;
        }
      }
    },
  ];

  // Returns the image upload URL.
  ds.getUploadUrl = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);
      return request_url;
  };

  ds.onReady = function() {
    ds.interface.allowedExtensions(ALLOWED_EXTENSIONS);
    ds.interface.setRequestUrl(ds.getUploadUrl());
    ds.interface.setRequestHeaders(ds.requestHeaders);
    ds.interface.defineHTTPSuccess([/2.{2}/]);
    ds.interface.useArray(false);
    ds.interface.setPostData({"title": "Untitled"})
    $log.debug("Ready: droplet ready", ds.interface);
  };

  ds.onSuccess = function(callback) {
    return function(event, response, files) {
      $log.debug("Success: droplet uploaded file: ", files, response);
      if (callback) {
        callback(event, response, files);
      }
    };
  };

  ds.onError = function(callback) {
    return function(event, response) {
      $log.debug("Error: droplet uploaded file: ", response);
      if(callback) {
        callback(event, response);
      }
    };
  };

  ds.onFileAdded = function(success, error) {
    return function(event, model) {
      $log.debug("Notification: droplet file added", model);
      var errors = [], valid = true, validator;

      // run validator tests against the model and the droplet queue
      for(var i = 0; i < ds.validators.length; i++) {
        validator = ds.validators[i];
        valid = validator.fn.call(validator, model, errors);
        if (!valid) {
          break;
        }
      }

      // check the validation result and invoke the appropriate callback
      if (valid) {
        success(event, model);
      } else {
        model.deleteFile(); // remove the model from the droplet queue because it isn't valid
        error(event, model, errors.join('\n'));
      }
    };
  };

  ds.onFileDeleted = function(callback) {
    return function(event, model) {
      $log.debug("Notification: droplet file deleted", model);
      if(callback) {
        callback(event, model);
      }
    };
  };

  ds.getTotalValid = function() {
    return ds.interface ? ds.getValidFiles().length : 0;
  };

  ds.getValidFiles = function() {
    return ds.interface.getFiles(ds.interface.FILE_TYPES.VALID) || [];
  };

  ds.uploadFiles = function() {
    if (ds.interface) {
      $log.debug("Notification: uploadFiles()")
      ds.interface.uploadFiles();
    } else {
      $log.error("Error: droplet interface not available to upload files");
    }
  };

  ds.getUploadSize = function() {
    var files = ds.getValidFiles() || [];
    return files.reduce(function(totalSize, item){
      return totalSize + item.file.size;
    }, 0);
  };

  ds.getUploadSizeMB = function() {
    return ds.getSizeInMegabytes(ds.getUploadSize());
  };

  ds.isValidUploadSize = function() {
    return ds.getUploadSize() <= ds.limits.uploadSize;
  };

  ds.isValidFileSize = function(file) {
    var limit = ds.limits.imageSize;
    if (ds.isZipFile(file)) {
      limit = ds.limits.zipSize;
    }
    return file.size <= limit;
  };

  ds.isZipFile = function(file) {
    return file.type.indexOf("zip") !== -1;
  };

  ds.getSizeInMegabytes = function(size, fixed) {
    fixed = fixed || 2;
    return (size / ONE_MEGABYTE).toFixed(2);
  };

}]);

angular.module('media_manager')
.factory('Image', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  return $resource(host + '/images/:id',
    { id: '@id'}, {
      'update': {
        method:'PUT',
        headers: headers
      },
      'get': {
        method: 'GET',
        headers: headers
      },
      'delete': {
        method: 'DELETE',
        headers: headers
      }
    }
  );
}]);

angular.module('media_manager')
.service('ImageBehavior', ['$q', '$log', 'Image', 'CourseCache', '$uibModal', function($q, $log, Image, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteImage = function(id) {
        var image = new Image({ id: id });
        return image.$delete(function() {
            CourseCache.removeImage(id);
        });
    };

    service.deleteImageModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/components/modalConfirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                var image = CourseCache.getImageById(id);
                cd.confirm_msg = "Are you sure you want to delete image " + image.title + " (ID:" + image.id + ")? ";
                cd.ok = function() {
                    var deletePromise = service.actuallyDeleteImage(id);
                    deletePromise.then(function() {
                        deferredDelete.resolve("success");
                    }, function() {
                        deferredDelete.reject("error");
                    });
                    modalInstance.close();
                };
                cd.cancel = function() {
                    modalInstance.close();
                    deferred.reject("cancel")
                };
            }],
            controllerAs: 'cd',
            size: 'sm'
        });
        return deferredDelete.promise;
    };

}]);

angular.module('media_manager')
.service('ImageLightBox', ['$uibModal', function($uibModal){
  var service = this;

  service.imageModal = function(images, index) {
    index = index || 0;
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: '/static/app/templates/imageLightBox.html',
      controller: ['$scope', 'Image', 'ImageBehavior', function($scope, Image, ImageBehavior) {
        var lb = this;
        lb.index = index;
        lb.total = images.length;
        lb.image = images[lb.index];
        lb.imageBehavior = ImageBehavior;

        lb.delete = function(image){
          
        };

        lb.next = function(){
          if(lb.index < images.length){
            lb.index++;
            lb.image = images[lb.index];
          }
        };
        lb.prev = function(){
          if(lb.index > 0){
            lb.index--;
            lb.image = images[lb.index];
          }
        };
      }],
      controllerAs: 'lb',
      size: 'lg'
    });
    return;
  };


}]);

angular.module('media_manager').factory('Notifications', function() {
    var IDGEN = 0;
    var service = {
        TYPE: {
          INFO:"info",
          WARNING:"warning",
          SUCCESS:"success",
          ERROR:"danger"
        },
        DEFAULT_TOPIC: 'default',
        messages: [],
        nextid: function() {
          IDGEN++;
          return IDGEN;
        },
        notify: function(type, msg, topic) {
          topic = topic || this.DEFAULT_TOPIC;
          if(this.isRepeated(msg, topic)) {
            return this;
          }
          this.messages.push({
            "id": this.nextid(),
            "type": type,
            "content": msg,
            "topic": topic,
            "timestamp": Date.now()
          });
          console.log("notify", this.messages, this);
          return this;
        },
        info: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.INFO);
          return this.notify.apply(this, args);
        },
        warn: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.WARNING);
          return this.notify.apply(this, args);
        },
        success: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.SUCCESS);
          return this.notify.apply(this, args);
        },
        error: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.ERROR);
          return this.notify.apply(this, args);
        },
        getLast: function() {
          if (this.messages.length == 0) {
            return null;
          }
          return this.messages[this.messages.length - 1];
        },
        filterMessagesByTopic: function(messages, topic) {
          topic = topic || this.DEFAULT_TOPIC;
          if(topic == "*") {
            return messages;
          }
          return messages.filter(function(msg) {
            return msg.topic == topic;
          });
        },
        isRepeated: function(msg, topic) {
          if (this.getLast()) {
            return msg == this.getLast().content && topic == this.getLast().topic;
          }
          return false;
        },
        clear: function() {
          while(this.messages.length > 0) {
            this.messages.shift();
          }
          return this;
        },
        delete: function(message) {
          var found = -1;
          for(var i = 0; i < this.messages.length; i++) {
            if(this.messages[i].id == message.id) {
              found = i;
              break;
            }
          }
          if(found >= 0) {
            this.messages.splice(found, 1);
          }
          return this;
        },
        handlePromise: function(promise, options) {
          var self = this;
          return promise.then(function(data) {
            var msg = options.msgProp ? data[options.msgProp] : options.msgText || "Success";
            self.clear().success(msg);
          }).catch(function(data) {
            var msg = options.errorProp ? data[options.errorProp] : options.errorText || "Error";
            self.clear().error(msg);
          });
        }
    };
    return service;
});

angular.module('media_manager').service('Preferences', function() {
    var pr = this;
    var default_prefs = {
        ui: {
            workspace: {
                layout: "gallery",
                _values: ["gallery", "list"]
            }
        }
    };
    
    pr.prefs = default_prefs;
    pr.UI_WORKSPACE_LAYOUT = "ui.workspace.layout";
    
    // Returns the value for a given key.
    pr.get = function(key) {
        var val, path, i;
        if (typeof key == "undefined") {
            return pr.prefs;
        }

        if (key.indexOf('.') == -1) {
            val = pr.prefs[key];
        } else {
            for(path = key.split('.'), val = pr.prefs[path[0]], i = 1; i < path.length; i++) {
                if (!val.hasOwnProperty(path[i])) {
                    throw "Error looking up preference. No such key exists: " + key;
                }
                val = val[path[i]];
            }
        }
        return val;
    };
    
    // Sets the value for a given key.
    pr.set = function(key, value) {
        var path, obj, i, k;
        if (typeof key == "undefined") {
            throw "Error setting preference key/value. Key parameter is *required*."
        }

        if (key.indexOf('.') == -1) {
            pr.prefs[key] = value;
        } else {
            path = key.split('.');
            obj = pr.prefs;
            for(i = 0; i < path.length - 1; i++) {
                k = path[i];
                obj = obj[k] || {};
            }
            k = path[path.length-1];
            if(obj.hasOwnProperty("_values")) {
                if(obj._values.indexOf(value) < 0) {
                    console.log("Invalid preference value", value, " in ", obj);
                    throw new Error("Invalid preference value: " + value);
                }
            }
            obj[k] = value;
        }
    };
    
});
