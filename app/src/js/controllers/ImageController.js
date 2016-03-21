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

  $scope.$watch(function watch(scope){
    return CourseCache.current_image;
  }, function handleChange(newval, oldval){
    if(newval.id != oldval.id){
      resetBreadcrumb();
    }
  });
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
  ic.saveMetadata = function(label, value, index){
    console.log("saveMetadata");
    if(index !== undefined){
      console.log(index);
      console.log(ic.image.metadata);

      ic.image.metadata[index].label = label;
      ic.image.metadata[index].value = value;
      Image.update({}, ic.image, function success(data){

      }, function failure(errorResponse){
        $log.debug("error updating image:", errorResponse);
      });

    } else {

      if(ic.newLabel){
        if(ic.image.metadata == null) {
          ic.image.metadata = [];
        }
        ic.image.metadata.push({'label': ic.newLabel, 'value': ic.newValue});
        Image.update({}, ic.image, function success(data){
          ic.newLabel = '';
          ic.newValue = '';
          ic.editNewMetadata = false;
        }, function failure(errorResponse) {
          $log.debug("error updating image:", errorResponse);
          ic.image.metadata.pop();
        });
      }
    }
  };

  ic.editNewMetadata = false;
  ic.showNewMetadata = function(){
    ic.editNewMetadata = true;
  };

}]);
