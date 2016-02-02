angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', function($routeParams, CourseCache, ImageBehavior){
  var ic = this;

  ic.imageBehavior = ImageBehavior;
  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0;
  ic.total = CourseCache.images.length;
  CourseCache.images.forEach(function(img, index){
    if(img.id == $routeParams.imageId){
      ic.image = img;
      ic.index = index;
    }
  });

  ic.next = function(){
    if(ic.index < CourseCache.images.length){
      ic.index++;
      ic.image = CourseCache.images[ic.index];
    }
  };

  ic.prev = function(){
    if(ic.index > 0){
      ic.index--;
      ic.image = CourseCache.images[ic.index];
    }
  }

}]);
