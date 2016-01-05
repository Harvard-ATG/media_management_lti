angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    '$routeParams',
                                    '$location',
                                    'Droplet',
                                    'Course',
                                    'Collection',
                                    function($scope,
                                      $timeout,
                                      $routeParams,
                                      $location,
                                      Droplet,
                                      Course,
                                      Collection){


  var wc = this;
  wc.Droplet = Droplet;
  wc.courseImages = Course.getImages({id: 1});
  wc.courseCollections = Course.getCollections({id: 1});

  Droplet.scope = $scope;
  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);
  $scope.$on('$dropletFileAdded', function(){
    wc.Droplet.interface.uploadFiles();
  });

  // TODO: upload...




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

  wc.saveCollection = function(){
    if($routeParams.collectionId === undefined){
      console.log("new collection");
      // post to create a new collection
      wc.collection.course_id = 1;

      // post to save a new collection
      Collection.save({}, wc.collection, function(data){

        var collectionPostData = wc.collection.images.map(function(image){
          return {course_image_id: image.id};
        });
        // posting the array of images
        Collection.saveImages({id: data.id}, collectionPostData, function(data){
          //wc.courseCollections = Course.getCollections({id: 1});
          wc.courseCollections.push(wc.collection);
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
      });


    }
  };

  wc.deleteCollection = function(id){
    Collection.delete({id: id}, function(){
      //wc.courseCollections = Course.getCollections({id: 1});
      wc.courseCollections.forEach(function(collection, index){
        if(collection.id == id){
          wc.courseCollections.splice(index, 1);
        }
      });
      $location.path('/');
    });
  };



}]);
