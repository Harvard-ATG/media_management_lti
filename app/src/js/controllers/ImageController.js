angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, Image){
  var ic = this;

  ic.imageBehavior = ImageBehavior;
  ic.CourseCache = CourseCache;
  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0;
  CourseCache.images.forEach(function(img, index){
    if(img.id == $routeParams.imageId){
      ic.image = img;
      ic.index = index;
    }
  });

  var crumbed = false;
  var resetBreadcrumb = function(){
    if(crumbed){
      Breadcrumbs.popCrumb();
    }
    Breadcrumbs.addCrumb("Image " + CourseCache.current_image.id, $location.url());
    crumbed = true;
  }

  ic.save = function(){
    var image = CourseCache.current_image;
    Image.update({}, image, function success(data){

    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });
  };

  ic.next = function(){
    if(ic.index + 1 < CourseCache.images.length){
      ic.index++;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
      resetBreadcrumb();
    }
  };

  ic.prev = function(){
    if(ic.index > 0){
      ic.index--;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
      resetBreadcrumb();
    }
  };

  ic.newLabel = '';
  ic.newValue = '';
  ic.saveMeta = function(){
    ic.image.metadata.push({'label': ic.newLabel})
  };

}]);
