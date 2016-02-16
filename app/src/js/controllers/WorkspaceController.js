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


  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());

  CourseCache.load();

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
          CourseCache.images.push(response[i]);
        }
      } else {
        CourseCache.images.push(response);
      }
      wc.filesToUpload = Droplet.getTotalValid();
      wc.notifications.clear().success("Images uploaded successfully");
  }));
  
  //$(document).scroll(wc.onDocumentScroll);
}]);
