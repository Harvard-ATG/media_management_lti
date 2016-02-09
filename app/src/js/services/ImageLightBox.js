angular.module('media_manager')
.service('ImageLightBox', ['$uibModal', function($uibModal){
  var service = this;

  service.imageModal = function(images, index) {
    index = index || 0;
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: '/static/app/templates/imageLightBox.html',
      controller: ['$scope', 'Image', 'ImageBehavior', function($scope, Image, ImageBehavior) {
        var lb = this;
        lb.index = index;
        lb.total = images.length;
        lb.image = images[lb.index];
        lb.imageBehavior = ImageBehavior;

        lb.delete = function(image){
          
        };

        lb.next = function(){
          if(lb.index < images.length){
            lb.index++;
            lb.image = images[lb.index];
          }
        };
        lb.prev = function(){
          if(lb.index > 0){
            lb.index--;
            lb.image = images[lb.index];
          }
        };
      }],
      controllerAs: 'lb',
      size: 'lg'
    });
    return;
  };


}]);
