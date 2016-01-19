angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    '$routeParams',
                                    '$location',
                                    '$uibModal',
                                    'Droplet',
                                    'Course',
                                    'Collection',
                                    'CollectionCache',
                                    'ImageCache',
                                    function($scope,
                                      $timeout,
                                      $routeParams,
                                      $location,
                                      $uibModal,
                                      Droplet,
                                      Course,
                                      Collection,
                                      CollectionCache,
                                      ImageCache){


  var wc = this;
  wc.Droplet = Droplet;
  if(ImageCache.images.length === 0){
    ImageCache.images = Course.getImages({id: 1});
  }
  wc.courseImages = ImageCache.images;

  if(CollectionCache.collections.length === 0){
    CollectionCache.collections = Course.getCollections({id: 1});
  }
  wc.courseCollections = CollectionCache.collections;

  Droplet.scope = $scope;
  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);
  $scope.$on('$dropletFileAdded', function(){
    wc.Droplet.interface.uploadFiles();
  });

  wc.isActiveCollection = function(id){
    if(id == wc.collection.id){
      return true;
    }
    return false;
  };



  if($routeParams.collectionId !== undefined){
    wc.collection = Collection.get({id: $routeParams.collectionId});
  } else {
    //wc.collection = [];
    wc.collection = new Collection();
    wc.collection.images = [];
    wc.collection.title = "Untitled Collection";

  }


  wc.addFile = function(image){
    wc.collection.images.push(image);
  };

  wc.removeFile = function(image){
    wc.collection.images.forEach(function(imageInstance, arr, index){
      if(imageInstance.id == image.id){
        wc.collection.images.splice(index, 1);
      }
    });
  };

  wc.saveCollection = function(){
    if($routeParams.collectionId === undefined){
      console.log("new collection");
      // post to create a new collection
      wc.collection.course_id = 1;

      // post to save a new collection
      Collection.save({}, wc.collection, function(data){

        console.log(data);

        var collectionPostData = wc.collection.images.map(function(image){
          return {course_image_id: image.id};
        });
        // posting the array of images
        Collection.saveImages({id: data.id}, collectionPostData, function(){
          //wc.courseCollections = Course.getCollections({id: 1});
          wc.collection.id = data.id;
          wc.courseCollections.push(wc.collection);
          $location.path('/collections/');
        });

      });

    } else {
      console.log("update collection");
      console.log(wc.collection.id);
      if(wc.collection.description == ''){
        wc.collection.description = "something";
      }

      Collection.update({}, wc.collection, function(data){

        var collectionPostData = wc.collection.images.map(function(image){
          return {course_image_id: image.id};
        });
        // posting the array of images
        Collection.saveImages({id: data.id}, collectionPostData, function(data){
          //wc.courseCollections = Course.getCollections({id: 1});
          wc.courseCollections.push(wc.collection);
        });
      }, function(data){

        console.log("failed.. but still going forward!");
        var collectionPostData = wc.collection.images.map(function(image){
          return {course_image_id: image.id};
        });
        // posting the array of images
        Collection.saveImages({id: data.id}, collectionPostData, function(data){
          //wc.courseCollections = Course.getCollections({id: 1});
          wc.courseCollections.push(wc.collection);
        });

      });


    }
  };




}]);
