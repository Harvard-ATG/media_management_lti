angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    redirectTo: "/collections"
  })
  .when('/workspace', {
    templateUrl: "/static/app/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/workspace/:collectionId', {
    templateUrl: "/static/app/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "/static/app/templates/collectionList.html",
    controller: 'ListController',
    controllerAs: 'lc'
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/miradorView.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  });
}]).run(function($http) {
  $http.defaults.headers.common.Authorization = 'Token ' + window.appConfig.access_token;
})

angular.module('media_manager').controller('BreadcrumbsController', ['$rootScope', '$scope', 'Breadcrumbs', function($rootScope, $scope, Breadcrumbs) {
    var br = this;
    $scope.crumbs = Breadcrumbs.crumbs;
}]);
angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope){
  var ic = this;

  ic.imageBehavior = ImageBehavior;
  ic.CourseCache = CourseCache;
  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0;
  CourseCache.images.forEach(function(img, index){
    if(img.id == $routeParams.imageId){
      ic.image = img;
      ic.index = index;
    }
  });

  var crumbed = false;
  var resetBreadcrumb = function(){
    if(crumbed){
      Breadcrumbs.popCrumb();
    }
    Breadcrumbs.addCrumb("Image " + CourseCache.current_image.id, $location.url());
    crumbed = true;
  }

  $scope.$watch(function watch(scope){
    return CourseCache.current_image;
  }, function handleChange(newval, oldval){
    resetBreadcrumb();
  });

  ic.next = function(){
    if(ic.index + 1 < CourseCache.images.length){
      ic.index++;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
      resetBreadcrumb();
    }
  };

  ic.prev = function(){
    if(ic.index > 0){
      ic.index--;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
      resetBreadcrumb();
    }
  }

}]);

angular.module('media_manager').controller('ListController', [
    '$scope',
    'CourseCache',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    function(
    $scope,
    CourseCache,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
    }
]);
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
    var miradorUrl = "/mirador/:collection_id";
    miradorUrl = miradorUrl.replace(':collection_id', $routeParams.collectionId);
    
    mr.canRead = AppConfig.perms.read;
    mr.iframeSrc =  miradorUrl;
    
    Breadcrumbs.home().addCrumb("Mirador", $location.url());
}]);
angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    '$log',
                                    '$routeParams',
                                    '$location',
                                    '$uibModal',
                                    'Droplet',
                                    'Course',
                                    'Collection',
                                    'CourseCache',
                                    'CollectionBehavior',
                                    'ImageLightBox',
                                    'Breadcrumbs',
                                    'AppConfig',
                                    function($scope,
                                      $timeout,
                                      $log,
                                      $routeParams,
                                      $location,
                                      $uibModal,
                                      Droplet,
                                      Course,
                                      Collection,
                                      CourseCache,
                                      CollectionBehavior,
                                      ImageLightBox,
                                      Breadcrumbs,
                                      AppConfig){


  var wc = this;

  wc.imagelb = ImageLightBox;

  wc.imageView = function(id){
    $location.path('/image/' + id);
  };

  wc.isActiveCollection = function(id){
    return id == wc.collection.id;
  };

  wc.loadActiveCollection = function() {
    var collection;
    if($routeParams.collectionId !== undefined){
      collection = Collection.get({id: $routeParams.collectionId});
    } else {
      //wc.collection = [];
      collection = new Collection();
      collection.images = [];
      collection.title = "Untitled Collection";
    }
    return collection
  };


  wc.addToCollection = function(courseImage){
    wc.collection.images.push(courseImage);
    var $el = $("#image-collection-panel .panel-body")
    console.log("add", courseImage, $el.css("overflow-x"));
    if ($el.css("overflow-x") == "auto") {
      $el.animate({"scrollLeft": $el.width()});
    }
  };

  wc.removeFromCollection = function(imageIndex){
    wc.collection.images.splice(imageIndex, 1);
  };

  wc.canDeleteCollection = function() {
    return wc.collection.id ? true : false;
  };

  wc.deleteCollection = function() {
    var collection_id = wc.collection.id;
    var deletePromise = CollectionBehavior.deleteCollectionModal(collection_id);
    deletePromise.then(function(result) {
      $location.path('/collections/');
    }, function(result) {
      $log.debug("error deleting collection", collection_id);
    });
  };

  wc.cancelCollection = function() {
    $location.path('/collections/');
  };

  wc.saveCollection = function(){
    if($routeParams.collectionId){
      wc.updateCollection();
    } else {
      wc.createCollection();
    }
  };

  wc.updateCollection = function() {
    $log.debug("update collection", wc.collection.id);
    wc.collection.description = wc.collection.description || "No description";
    wc.collection.course_image_ids = wc.collection.images.map(function(image) {
      // images could come from the image library, or already be part of the collection
      // and we want to make sure we're returning the image "id" property, not the collectionimage "id"
      image_prop_for = {
        "collectionimages": "course_image_id",
        "images": "id"
      };
      return image[image_prop_for[image.type]];
    })

    // put to update collection
    Collection.update({}, wc.collection, function(data){
      wc.collection = wc.loadActiveCollection();
    }, function(errorResponse) {
      $log.debug("error updating collection:", errorResponse);
    });
  };

  wc.createCollection = function() {
    $log.debug("create collection");
    wc.collection.course_id = AppConfig.course_id;
    wc.collection.course_image_ids = wc.collection.images.map(function(image){
      return image.id;
    });

    // post to save a new collection
    Collection.save({}, wc.collection, function(data){
      wc.collection.id = data.id;
      wc.courseCollections.push(wc.collection);
      $location.path('/collections/');
    });
  };

  wc.onDocumentScroll = (function() {
    var fixedPosition = false;
    var fixedCls = 'image-collection-fixed';
    var fixedSelector = "#image-collection-panel";
    var offsetSelector = "#image-collection-panel";
    var offsetTop = null;

    return function(event) {
      var windowTop = $(window).scrollTop();
      if (fixedPosition) {
        if (windowTop < offsetTop) {
          $(fixedSelector).removeClass(fixedCls);
          fixedPosition = false;
        }
      } else {
        if (offsetTop === null) {
          offsetTop = $(offsetSelector).offset().top;
        }
        if (offsetTop < windowTop) {
          $(fixedSelector).addClass(fixedCls);
          fixedPosition = true;
        }
      }
    };
  })();


  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());

  CourseCache.load();

  wc.Droplet = Droplet;
  wc.courseImages = CourseCache.images;
  wc.courseCollections = CourseCache.collections;
  wc.collection = wc.loadActiveCollection();
  wc.canEdit = AppConfig.perms.edit;
  wc.filesToUpload = 0;
  wc.notifications = {
    messages: [],
    notify: function(type, msg) {
      if (this.canReset) {
        this.messages = [];
        this.canReset = false;
      }
      if (!this.isRepeated(msg)) {
        this.messages.push({"type": type, "content": msg});
      }
    },
    success: function(msg) {
      this.messages = [{"type": "success", "content": msg}];
      this.canReset = true;
    },
    error: function(msg) {
      this.messages = [{"type": "danger", "content": msg}];
      this.canReset = true;
    },
    getLast: function() {
      if (this.messages.length == 0) {
        return null;
      }
      return this.messages[this.messages.length - 1];
    },
    isRepeated: function(msg) {
      if (this.getLast()) {
        return msg == this.getLast().content;
      }
      return false;
    }
  }
  
  $scope.$on('$dropletReady', Droplet.onReady);
  $scope.$on('$dropletError', Droplet.onError(function(event, response) {
    wc.notifications.error(response);
  }));
  $scope.$on('$dropletFileAdded', Droplet.onFileAdded(function(event, model) {
    wc.filesToUpload = Droplet.getTotalValid();
  }, function(event, model, msg) {
    wc.filesToUpload = Droplet.getTotalValid();
    wc.notifications.notify("warning", msg);
  }));
  $scope.$on('$dropletFileDeleted', Droplet.onFileDeleted(function() {
    wc.filesToUpload = Droplet.getTotalValid();
  }));
  $scope.$on('$dropletSuccess', Droplet.onSuccess(function(event, response, files) {
      if (angular.isArray(response)) {
        for(var i = 0; i < response.length; i++) {
          CourseCache.images.push(response[i]);
        }
      } else {
        CourseCache.images.push(response);
      }
      wc.filesToUpload = Droplet.getTotalValid();
      wc.notifications.success("Images uploaded successfully");
  }));
  
  $(document).scroll(wc.onDocumentScroll);
}]);

angular.module('media_manager')
.directive('dropletThumb', [function(){
  return {
    scope: {
      image: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img style="background-image: url({{ image.thumb_url || image.image_url }})" class="droplet-preview" />',

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

angular.module('media_manager').service('AppConfig', function() {
    this.config = window.appConfig || {};
    this.perms = this.config.perms;
    this.course_id = this.config.course_id;
    this.access_token = this.config.access_token;
    this.authorization_header = "Token " + this.config.access_token;
    this.media_management_api_url = this.config.media_management_api_url;
});

angular.module('media_manager').service('Breadcrumbs', function() {
    var br = this;
    var default_crumbs = [{"text": "List Collections", "route": "/"}];
    this.crumbs = [];
    this.addCrumb = function(text, route) {
        this.crumbs.push({"text": text, "route": route});
    };
    this.popCrumb = function() {
        this.crumbs.pop();
    };
    this.home = function() {
        this.crumbs = angular.copy(default_crumbs);
        return this;
    }
    this.home();
});

angular.module('media_manager')
.factory('Collection', ['$resource',  'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  return $resource(host + '/collections/:id',
    { id: '@id' }, {
      'saveImages': {
        method: 'POST',
        url: host + '/collections/:id/images',
        isArray: true
      },
      'update': {
        method:'PUT'
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
            templateUrl: '/static/app/templates/confirmDelete.html',
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

angular.module('media_manager')
.factory('Course', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  return $resource(host + '/courses/:id',
    { id: '@id', image_id: '@image_id', collection_id: '@collection_id' }, {
      'getImages': {
        method: 'GET',
        isArray: true,
        url: host + '/courses/:id/images/:image_id'
      },
      'getCollections': {
        method: 'GET',
        isArray: true,
        url: host + '/courses/:id/collections/:collection_id'
      }
    }
  );
}]);

angular.module('media_manager')
.service('CourseCache', ['Course', 'AppConfig', function(Course, AppConfig){
  this.images = [];
  this.collections = [];
  this.current_image = {};
  this.loadImages = function() {
    if (this.images.length == 0) {
      this.images = Course.getImages({id: AppConfig.course_id});
      if(this.images.length > 0){
        this.current_image = images[0];
      }
    }

  };
  this.loadCollections = function() {
    if (this.collections.length == 0) {
      this.collections = Course.getCollections({id: AppConfig.course_id});
    }
  };
  this.load = function() {
    this.loadImages();
    this.loadCollections();
  };
  this.getCollectionById = function(id) {
    for (var i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) {
        return this.collections[i];
      }
    }
    return false;
  };
  this.getImageById = function(id){
    var that = this;
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
  };
}]);

angular.module('media_manager')
.service('Droplet', ['$timeout', '$log', '$q', 'AppConfig', function($timeout, $log, $q, AppConfig){
  var ds = this;

  ds.interface = null;
  
  ds.allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
  
  ds.maximumValidFiles = 10;

  ds.requestHeaders = {
    'Accept': 'application/json',
    'Authorization': AppConfig.authorization_header
  };
  
  // Returns the image upload URL.
  ds.getUploadUrl = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);
      return request_url;
  };

  ds.onReady = function() {
    ds.interface.allowedExtensions(ds.allowedExtensions);
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
      var total_valid = ds.getTotalValid();
      var is_valid_type = (model.type == ds.interface.FILE_TYPES.VALID)
      var is_valid_total = (total_valid <= ds.maximumValidFiles);
      var msg = "";
  
      if (is_valid_type && is_valid_total) {
        success && success(event, model);
      } else {
        $log.debug("Notification: file added is invalid; NOT uploading with extension: ", model.extension);
        //alert("Error: '" + model.file.name +"' is not valid for upload. Cannot upload file with extension '" + model.extension + "'. File must be one of: " + Droplet.allowedExtensions.join(", "));
        model.deleteFile();
        if (!is_valid_total) {
          msg = "Too many images to upload. You can upload " + ds.maximumValidFiles + " at a time.";
        } else if (!is_valid_type) {
          msg = "Invalid image: '" + model.file.name +"'. Cannot upload file with extension '" + model.extension + "'. File extension must be one of: " + ds.allowedExtensions.join(", ")
        }
        error && error(event, model, msg);
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
    return ds.interface ? ds.interface.getFiles(ds.interface.FILE_TYPES.VALID).length : 0;
  };

  ds.uploadFiles = function() {
    if (ds.interface) {
      $log.debug("Notification: uploadFiles()")
      ds.interface.uploadFiles();
    } else {
      $log.error("Error: droplet interface not available to upload files");
    }
  };
}]);

angular.module('media_manager')
.factory('Image', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  return $resource(host + '/images/:id',
    { id: '@id'}
  );
}]);

angular.module('media_manager')
.service('ImageBehavior', ['$q', '$log', 'Image', 'CourseCache', '$uibModal', function($q, $log, Image, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteImage = function(id) {
        var image = new Image({ id: id });
        return image.$delete(function() {
            var remove_at_idx = -1;
            var images = CourseCache.images;
            for(var idx = 0; idx < images.length; idx++) {
                if (images[idx].id == id) {
                    remove_at_idx = idx;
                    break;
                }
            }
            if (remove_at_idx >= 0) {
                $log.debug("removing image id ", id, " from cache at index", remove_at_idx);
                images.splice(remove_at_idx, 1);
                CourseCache.current_image = CourseCache.getPrevImage(id);
            }
        });
    };

    service.deleteImageModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/confirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                console.log("id: " + id);
                console.log(CourseCache.images);
                var image = CourseCache.getImageById(id);
                console.log(image);
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
