angular.module('media_manager')
.controller('WorkspaceController', ['$scope',
                                    '$timeout',
                                    'FileReader',
                                    'Droplet',
                                    'CourseImages',
                                    function($scope,
                                      $timeout,
                                      FileReader,
                                      Droplet,
                                      CourseImages){

  var wc = this;
  wc.Droplet = Droplet;
  wc.courseImages = CourseImages.get({id: 1}, function(){
    console.log(wc.courseImages);
  });

  Droplet.scope = $scope;
  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);

  wc.collection = [];
  wc.addFile = function(model){
    wc.collection.push(model);
  };

}]);
