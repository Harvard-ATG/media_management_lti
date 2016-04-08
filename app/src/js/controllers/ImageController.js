angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, Image){
  var ic = this;

  Breadcrumbs.addCrumb("Edit Image");
  
  ic.imageBehavior = ImageBehavior;
  ic.CourseCache = CourseCache;
  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.metadata = [];

  ic.index = 0;
  CourseCache.images.forEach(function(img, index){
    if(img.id == $routeParams.imageId){
      ic.image = img;
      ic.index = index;
    }
  });
  
  ic.save = function(){
    var image = CourseCache.current_image;
    Image.update({}, image, function success(data){

    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });
  };

  ic.next = function($event){
    $event.preventDefault();
    if(ic.index + 1 < CourseCache.images.length){
      ic.index++;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
    }
  };

  ic.prev = function($event){
    $event.preventDefault();
    if(ic.index > 0){
      ic.index--;
      ic.image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
    }
  };

  ic.newLabel = '';
  ic.newValue = '';
  ic.saveMetadata = function(label, value, index){
    if(index !== undefined){

      if(label === '' && value === ''){
        ic.image.metadata.splice(index, 1);
      } else {
        ic.image.metadata[index].label = label;
        ic.image.metadata[index].value = value;
      }

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
  ic.hideNewMetadata = function(){
    ic.editNewMetadata = false;
  };

  ic.deleteMetadata = function(index, form){
    ic.saveMetadata('', '', index);
    form.$cancel();
  }
  
  ic.defaultMetadataLabels = [
    'Date',
    'Type',
    'Format',
    'Source',
    'Repository',
    'Creator',
    'Dimensions'
  ];

  ic.getImageMetadata = function() {
    var metadata = [];
    var image_metadata = ic.image.metadata;
    var default_metadata = ic.defaultMetadataLabels.map(function(label) {
      return {'label': label, 'value': ''};
    });
    
    if (angular.isArray(image_metadata) && image_metadata.length > 0) {
      metadata = image_metadata;
    } else {
      metadata = default_metadata;
    }

    return metadata;
  };

  ic.deleteImage = function(){
    ic.imageBehavior.deleteImageModal(ic.CourseCache.current_image.id).then(function(){
      if(ic.index == ic.CourseCache.images.length){
        ic.index--;
      }
      if(ic.index < 0){
        ic.index = 0;
      }
      if(ic.CourseCache.images.length == 0){
        $location.path(Breadcrumbs.crumbs[Breadcrumbs.crumbs.length - 1].route);
      }
    });
  };
  
  $scope.$watch(function() {
    return ic.CourseCache.current_image.id;
  }, function(newVal, oldVal) {
    ic.metadata = ic.getImageMetadata();
  });
}]);
