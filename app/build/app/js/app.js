angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource', 'angularSpinner', 'as.sortable'])
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
    templateUrl: "/static/app/templates/collections.html",
    controller: 'CollectionsController',
    controllerAs: 'lc'
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/mirador.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  })
  .when('/error/:errorCode', {
    templateUrl: "/static/app/templates/error.html",
    controller: 'ErrorController',
    controllerAs: 'er'
  })
}])
.filter("asDate", function () {
    return function (input) {
        return new Date(input);
    }
})
.run(function($http) {
  $http.defaults.headers.common.Authorization = 'Token ' + window.appConfig.access_token;
});

angular.module('media_manager').controller('BreadcrumbsController', ['$rootScope', '$scope', 'Breadcrumbs', function($rootScope, $scope, Breadcrumbs) {
    $scope.crumbs = Breadcrumbs.crumbs;
}]);

angular.module('media_manager').controller('CollectionsController', [
    '$scope',
    'CourseCache',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    'Collection',
    function(
    $scope,
    CourseCache,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs,
    Collection) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        lc.dragControlListeners = {
          orderChanged: function(event){

            lc.collections.forEach(function(item, index, arr){
              var newsort = index + 1;
              if(item.sort_order !== newsort){
                arr[index].sort_order = newsort;
                Collection.update({id: item.id}, arr[index]);
              }
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
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, Image){
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
    if(newval.id != oldval.id){
      resetBreadcrumb();
    }
  });
  ic.save = function(){
    var image = CourseCache.current_image;
    Image.update({}, image, function success(data){

    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });
  };

  ic.save = function(){

    var image = CourseCache.current_image;
    Image.update({}, image, function success(data){

    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });
  };

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
angular.module('media_manager').controller('NotificationsController', ['$rootScope', '$scope', 'Notifications', function($rootScope, $scope, Notifications) {
    $scope.notifications = Notifications;
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
                                    'Notifications',
                                    'Preferences',
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
                                      Notifications,
                                      Preferences,
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
    var self = this, collection;
    if($routeParams.collectionId !== undefined){
      self.isLoadingCollection.status = true;
      collection = Collection.get({id: $routeParams.collectionId});
      collection.$promise.then(function(collection) {
        self.isLoadingCollection.status = false;
      });
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
    $timeout(function() {
      var $el = $("#image-collection-panel .panel-body")
      var el = $el[0];
      if ($el.css("overflow-x") == "auto") {
        el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
    }, 0, false);
  };

  wc.removeFromCollection = function(imageIndex){
    wc.collection.images.splice(imageIndex, 1);
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
    var self = this;

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
    self.isSavingCollection.status = true;
    Collection.update({}, wc.collection, function(data){
      wc.notifications.clear();
      var collection = wc.loadActiveCollection();
      self.isLoadingCollection.status = true;
      collection.$promise.then(function(collection) {
        wc.collection = collection;
      }, function(response) {
        wc.notifications.error("Error loading collection: " + response);
      }).finally(function() {
        self.isLoadingCollection.status = false;
      });
    }, function(errorResponse) {
      $log.debug("Error updating collection:", errorResponse);
      wc.notifications.error("Error updating collection: " + errorResponse);
    }).$promise.then(function(data) {
      $log.debug("Collection updated: ", data)
      wc.notifications.success("Collection saved.");
    }).finally(function() {
      self.isSavingCollection.status = false;
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

  // Fix the collection panel at the top of the screen 
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
  
  wc.onClickSortLibrary = function($event, choice) {
    $event.preventDefault();
    wc.sortLibrary(choice);
  };

  wc.sortLibrary = function(choice) {
    CourseCache.updateSort(choice.name, choice.dir).sortImages();
  };


  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());

  CourseCache.load();

  wc.layout = Preferences.get(Preferences.UI_WORKSPACE_LAYOUT);
  wc.Droplet = Droplet;
  wc.courseImages = CourseCache.images;
  wc.courseCollections = CourseCache.collections;
  wc.isLoading = CourseCache.isLoading;
  wc.isSavingCollection = {status:false, msg:"Saving collection..."};
  wc.isLoadingCollection = {status:false, msg:"Loading collection..."};
  wc.collection = wc.loadActiveCollection();
  wc.canEdit = AppConfig.perms.edit;
  wc.filesToUpload = 0;
  wc.notifications = Notifications;
  wc.sortChoices = [
    {'label': 'Newest to Oldest', 'name': 'created', 'dir': 'desc'},
    {'label': 'Oldest to Newest', 'name': 'created', 'dir': 'asc'},
    //{'label': 'Last Updated', 'name': 'updated', 'dir': 'desc'},
    {'label': 'Title', 'name': 'title', 'dir': 'asc'},
  ];
  
  wc.sortLibrary(wc.sortChoices[0]);

  wc.notifications.clear();
  
  $scope.$on('$dropletReady', Droplet.onReady);
  $scope.$on('$dropletError', Droplet.onError(function(event, response) {
    wc.notifications.clear().error(response);
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
          CourseCache.addImage(response[i]);
        }
      } else {
        CourseCache.addImage(response);
      }
      wc.filesToUpload = Droplet.getTotalValid();
      wc.notifications.clear().success("Images uploaded successfully");
  }));

  $scope.$watch('wc.layout', function(newVal, oldVal) {
    Preferences.set(Preferences.UI_WORKSPACE_LAYOUT, newVal);
  })
  
  //$(document).scroll(wc.onDocumentScroll);
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
            templateUrl: '/static/app/templates/modalConfirmDelete.html',
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
  this.isLoadingCollections = {"status": false, "msg": "Loading collections..."};
  this.isLoadingImages = {"status": false, "msg": "Loading images..."};
  this.isLoading = {"status": false, "msg": "Loading..."};
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
        this.current_image = this.getPrevImage(image_id);
        this.images.splice(remove_at_idx, 1);
        return true;
    }
    return false;
  };
  this.loadImages = function() {
    var self = this;
    this.isLoading.status = true;
    this.isLoadingImages.status = true;
    this.images = Course.getImages({id: AppConfig.course_id});
    this.images.$promise.then(function(images) {
      self.sortImages();
      self.current_image = images[0];
      self.isLoadingImages.status = false;
      self.isLoading.status = false || self.isLoadingCollections.status;
    });
  };
  this.loadCollections = function() {
    var self = this;
    this.isLoading.status = true;
    this.isLoadingCollections.status = true;
    this.collections = Course.getCollections({id: AppConfig.course_id});
    this.collections.$promise.then(function(collections) {
      self.isLoadingCollections.status = false;
      self.isLoading.status = false || self.isLoadingImages.status;
    });
  };
  this.load = function() {
    if (this.images.length == 0) {
      this.loadImages();
    }
    if (this.collections.length == 0) {
      this.loadCollections();
    }
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
    return null;
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
    { id: '@id'}, {
      'update': {
        method:'PUT'
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
            templateUrl: '/static/app/templates/modalConfirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                var image = CourseCache.getImageById(id);
                console.log("id:", id, "image:", image, "images:", CourseCache.images);
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

angular.module('media_manager').service('Notifications', function() {
    var notify = {
        TYPE: {
          INFO:"info",
          WARNING:"warning",
          SUCCESS:"success",
          ERROR:"danger"
        },
        messages: [],
        notify: function(type, msg) {
          if (this.canReset) {
            this.clear();
            this.canReset = false;
          }
          if (!this.isRepeated(msg)) {
            this.messages.push({"type": type, "content": msg});
          }
          return this;
        },
        info: function(msg) {
          return this.notify(this.TYPE.INFO, msg);
        },
        warn: function(msg) {
          return this.notify(this.TYPE.WARNING, msg);
        },
        success: function(msg) {
          return this.notify(this.TYPE.SUCCESS, msg);
        },
        error: function(msg) {
          return this.notify(this.TYPE.ERROR, msg);
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
        },
        clear: function() {
          this.messages = [];
          return this;
        },
        clearOnNext: function() {
          this.canReset = true;
          return this;
        }
    };
    return notify;
});

angular.module('media_manager').service('Preferences', function() {
    var pr = this;
    var default_prefs = {
        ui: {
            workspace: {
                layout: "gallery"
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
            obj[path[path.length-1]] = value;
        }
    };
    
});
