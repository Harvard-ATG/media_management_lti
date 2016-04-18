angular.module('media_manager')
.directive('dropletThumb', [function(){
  return {
    scope: {
      image: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img src="{{ image.thumb_url || image.image_url }}" class="droplet-preview" />',

  };
}]);
