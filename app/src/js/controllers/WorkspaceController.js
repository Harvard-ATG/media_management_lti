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
