angular.module('media_manager')
.controller('WorkspaceController', ['$scope', '$timeout', 'FileReader', 'Droplet', function($scope, $timeout, FileReader, Droplet){

  var wc = this;
  wc.Droplet = Droplet;

  Droplet.scope = $scope;
  $scope.$on('$dropletReady', Droplet.whenDropletReady);
  $scope.$on('$dropletSuccess', Droplet.onDropletSuccess);
  $scope.$on('$dropletError', Droplet.onDropletError);

  wc.collection = [];
  wc.addFile = function(model){
    wc.collection.push(model);
  };

}]);
