angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', function($routeParams, CourseCache){
  var ic = this;

  console.log("asdf");

  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0;
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
