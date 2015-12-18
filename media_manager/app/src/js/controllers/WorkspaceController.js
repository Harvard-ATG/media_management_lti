angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    'FileReader',
                                    'Droplet',
                                    'Courses',
                                    function($scope,
                                      $timeout,
                                      FileReader,
                                      Droplet,
                                      Courses){

  var wc = this;
  wc.Droplet = Droplet;
  wc.courseImages = Courses.getImages({id: 1});
  wc.courseCollections = CourseCollections.get({id: 1});


  Droplet.scope = $scope;
  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);

  // TODO: upload...

  wc.collection = [];
  wc.addFile = function(image){
    wc.collection.push(image);
  };

  wc.saveCollection = function(){
    if(wc.current_collection == undefined){
      // post to create a new collection

      // post the images array
    }
  };

}]);
