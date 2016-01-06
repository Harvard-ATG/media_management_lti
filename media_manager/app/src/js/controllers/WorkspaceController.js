angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    '$routeParams',
                                    '$location',
                                    '$uibModal',
                                    'Droplet',
                                    'Course',
                                    'Collection',
                                    function($scope,
                                      $timeout,
                                      $routeParams,
                                      $location,
                                      $uibModal,
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
          $location.path('/workspace/' + data.id);
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

  wc.deleteCollectionModal = function(id){
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: 'templates/confirmDelete.html',
      controller: ['$scope', function($scope){
        var cd = this;
        cd.ok = function(){
          wc.actuallyDeleteCollection(id);
          modalInstance.close();
        };
        cd.cancel = function(){
          modalInstance.close();  
        };
      }],
      controllerAs: 'cd',
      size: 'sm'
    });
  };

  wc.actuallyDeleteCollection = function(id){
    wc.collection.$delete(function(){
      wc.courseCollections.forEach(function(collection, index){
        if(collection.id == id){
          wc.courseCollections.splice(index, 1);
        }
      });
      $location.path('/workspace');
    });
  };



}]);
