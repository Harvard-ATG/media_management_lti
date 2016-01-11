angular.module('media_manager')
.directive('dropletThumb', [function(){
  return {
    scope: {
      image: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img style="background-image: url({{ image.thumb_url || image.image_url }})" class="droplet-preview" />',

  };
}]);
