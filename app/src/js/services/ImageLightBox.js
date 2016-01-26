angular.module('media_manager')
.service('ImageLightBox', ['$uibModal', function($uibModal){
  var service = this;

  service.imageModal = function(image) {
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: '/static/app/templates/imageLightBox.html',
      controller: ['$scope', function($scope) {
        var cd = this;
        cd.image = image;
      }],
      controllerAs: 'cd',
      size: 'lg'
    });
    return;
  };


}]);
