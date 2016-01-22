angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    '$routeParams',
                                    '$location',
                                    '$uibModal',
                                    'Droplet',
                                    'Course',
                                    'Collection',
                                    'CourseCache',
                                    'AppConfig',
                                    function($scope,
                                      $timeout,
                                      $routeParams,
                                      $location,
                                      $uibModal,
                                      Droplet,
                                      Course,
                                      Collection,
                                      CourseCache,
                                      AppConfig){


  var wc = this;

  wc.canEdit = AppConfig.perms.edit;
  
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

  wc.saveCollection = function(){
    if($routeParams.collectionId){
      wc.updateCollection();
    } else {
      wc.createCollection();
    }
  };
  
  wc.updateCollection = function() {
    console.log("update collection", wc.collection.id);
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
      console.log("error updating collection:", errorResponse);
    }); 
  };

  wc.createCollection = function() {
    console.log("create collection");
    wc.collection.course_id = 1;
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

  CourseCache.load();
  
  wc.courseImages = CourseCache.images;
  wc.courseCollections = CourseCache.collections;

  wc.Droplet = Droplet;
  wc.collection = wc.loadActiveCollection();
  
  Droplet.scope = $scope;
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
