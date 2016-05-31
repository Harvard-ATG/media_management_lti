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

  wc.hideLibrary = true;
  wc.hideAddImage = true;

  var dragEnabled = true;
  wc.dragControlListeners = {
    accept: function(sourceItemHandleScope, destSortableScope){
      return dragEnabled;
    },
    orderChanged: function(event){
      dragEnabled = false;

      var updates = [];
      wc.collection.images.forEach(function(item, index, arr){
        var newsort = index + 1;
        wc.collection.images[index].sort_order = newsort;
      });
      dragEnabled = true;
      wc.saveCollection("Collection order changed.");
    }
  };

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
        collection.images.sort(function(a, b){
          var x = a['sort_order'];
          var y = b['sort_order'];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
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
    wc.saveCollection(courseImage.title + " added to collection.");
  };

  wc.inCollection = function(courseImage){
    in_collection = false;
    if(wc.collection.images != undefined){
      wc.collection.images.some(function(item){
        if(item.course_image_id == courseImage.id){
          in_collection = true;
          return true;
        }
      });
    }
    return in_collection;
  };

  wc.removeFromCollection = function(id){
    // note this needs to be a forEach/search instead of a splice because
    // ng-sortable won't work with "track by $index" enabled on the ng-repeat
    // https://github.com/a5hik/ng-sortable/issues/221
    wc.collection.images.some(function(item, index, arr){
      if(item.id == id){
        wc.collection.images.splice(index, 1);
        wc.saveCollection(item.title + " removed from collection.");
        return true;
      }
    });
  };

  wc.cancelCollection = function() {
    $location.path('/collections/');
  };

  wc.saveCollection = function(message){
    if($routeParams.collectionId){
      return wc.updateCollection(message);
    } else {
      return wc.createCollection();
    }
  };

  wc.updateCollection = function(message) {
    var self = this;

    $log.debug("update collection", wc.collection.id);
    wc.collection.description = wc.collection.description;
    wc.collection.course_image_ids = wc.collection.images.map(function(image) {
      // images could come from the image library, or already be part of the collection
      // and we want to make sure we're returning the image "id" property, not the collectionimage "id"
      image_prop_for = {
        "collectionimages": "course_image_id",
        "images": "id"
      };
      return image[image_prop_for[image.type]];
    });

    // PUT to update collection
    self.isSavingCollection.status = true;

    return Collection.update({}, wc.collection, function(data){
      wc.notifications.clear();
      var collection = wc.loadActiveCollection();
      self.isLoadingCollection.status = true;
      collection.$promise.then(function(collection) {
        wc.collection = collection;

        // update the CourseCache.collections since it is stale
        var collection_idx = wc.courseCollections.map(function(c) { return c.id; }).indexOf(collection.id);
        if (collection_idx >= 0) {
          wc.courseCollections.splice(collection_idx, 1, collection);
        }
        $log.debug("insert updated collection into cache at index: ", collection_idx);
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
      if(!message){
        message = "Collection saved.";
      }
      wc.notifications.success(message);
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
    return Collection.save({}, wc.collection, function(data){
      wc.collection.id = data.id;
      wc.courseCollections.push(wc.collection);
      $location.path('/workspace/'+data.id);
    });
  };


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
  wc.fileUploadSize = 0;
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
    wc.notifications.clear().setLocation('upload').error(response);
  }));
  $scope.$on('$dropletFileAdded', Droplet.onFileAdded(function(event, model) {
    wc.filesToUpload = Droplet.getTotalValid();
    wc.fileUploadSize = Droplet.getUploadSizeMB();
    wc.notifications.clear();
  }, function(event, model, msg) {
    wc.filesToUpload = Droplet.getTotalValid();
    wc.fileUploadSize = Droplet.getUploadSizeMB();
    wc.notifications.clear().setLocation('upload').notify("warning", msg);
  }));
  $scope.$on('$dropletFileDeleted', Droplet.onFileDeleted(function() {
    wc.filesToUpload = Droplet.getTotalValid();
    wc.fileUploadSize = Droplet.getUploadSizeMB();
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
      wc.fileUploadSize = Droplet.getUploadSizeMB();
      wc.notifications.clear().setLocation('upload').success("Images uploaded successfully");
  }));

  $scope.$watch('wc.layout', function(newVal, oldVal) {
    Preferences.set(Preferences.UI_WORKSPACE_LAYOUT, newVal);
  });

}]);
