angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope){
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

  ic.metachanged = false;
  $scope.$watch(function watch(scope){
    return CourseCache.current_image;
  }, function handleChange(newval, oldval){
    console.log("changing!");
    console.log(oldval);
    console.log(newval);
    if(newval.id == oldval.id){
      ic.metachanged = true;
    } else {
      resetBreadcrumb();
      ic.metachanged = false;
    }
  });


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
  }

}]);
