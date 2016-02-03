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
  });
}]).run(function($http) {
  $http.defaults.headers.common.Authorization = 'Token ' + window.appConfig.access_token;
})

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
  this.loadImages = function() {
    if (this.images.length == 0) {
      this.images = Course.getImages({id: AppConfig.course_id});
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
}]);

angular.module('media_manager')
.service('Droplet', ['$timeout', 'AppConfig', function($timeout, AppConfig){
  var ds = this;
  ds.interface = {};
  ds.uploadCount = 0;
  ds.success = false;
  ds.error = false;
  ds.scope = undefined;

  // Listen for when the interface has been configured.
  ds.whenDropletReady = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);

      ds.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif']);
      ds.interface.setRequestUrl(request_url);
      ds.interface.setRequestHeaders({
        'Accept': 'application/json',
        'Authorization': AppConfig.authorization_header
      })
      ds.interface.defineHTTPSuccess([/2.{2}/]);
      ds.interface.useArray(false);
      ds.interface.setPostData({"title": "Untitled"})
  };

  // Listen for when the files have been successfully uploaded.
  ds.onDropletSuccess = function(event, response, files) {
      ds.scope.uploadCount = files.length;
      ds.scope.success     = true;

      $timeout(function timeout() {
          ds.scope.success = false;
      }, 5000);

      console.log("droplet success", event, response, files);
      ds.scope.$broadcast('$dropletUploadComplete', response, files);
  };

  // Listen for when the files have failed to upload.
  ds.onDropletError = function(event, response) {
      console.log("onDropletError", event, response);
      ds.scope.error = true;

      $timeout(function timeout() {
          ds.scope.error = false;
      }, 5000);

      console.log("droplet error", event, response);
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

angular.module('media_manager').controller('BreadcrumbsController', ['$rootScope', '$scope', 'Breadcrumbs', function($rootScope, $scope, Breadcrumbs) {
    var br = this;
    $scope.crumbs = Breadcrumbs.crumbs;
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
                                      Breadcrumbs,
                                      AppConfig){


  var wc = this;
  
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

  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());
  
  CourseCache.load();
  Droplet.scope = $scope;
  
  wc.courseImages = CourseCache.images;
  wc.courseCollections = CourseCache.collections;
  wc.Droplet = Droplet;
  wc.collection = wc.loadActiveCollection();
  wc.canEdit = AppConfig.perms.edit;

  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);
  $scope.$on('$dropletFileAdded', function(){
    wc.Droplet.interface.uploadFiles();
  });
  $scope.$on('$dropletUploadComplete', function(event, response, files) {
    wc.courseImages.push(response);
  });

}]);
