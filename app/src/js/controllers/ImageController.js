angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, Image){
  var ic = this;

  Breadcrumbs.addCrumb("Edit Image");
  
  ic.imageBehavior = ImageBehavior;
  ic.CourseCache = CourseCache;
  ic.image = CourseCache.getImageById($routeParams.imageId);
  ic.index = 0; // initialize to zero, but should be updated to the corret value
 
  ic.defaultMetadataLabels = [
    'Date',
    'Type',
    'Format',
    'Source',
    'Repository',
    'Creator',
    'Dimensions'
  ];
  
  ic.updateImageIndex = function() {
    var images = CourseCache.images;
    for(var index = 0, img = null, len = images.length; index < len; index++) {
      img = images[index];
      if(img.id == $routeParams.imageId){
        ic.image = img;
        ic.index = index;
        break;
      }
    }
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

  ic.getDefaultMetadata = function() {
      return ic.defaultMetadataLabels.map(function(label) {
        return {'label': label, 'value': ''};
      });
  };

  ic.getImageMetadata = function() {
    var metadata = [];
    var image_metadata = ic.image.metadata;
    var default_metadata = ic.getDefaultMetadata();
    
    if (angular.isArray(image_metadata) && image_metadata.length > 0) {
      metadata = angular.copy(image_metadata);
    } else {
      metadata = default_metadata;
    }

    return metadata;
  };

  ic.metaForm = {
    data: [],
    visible: false,
    waiting: false,
    hasError: false,
    hasSuccess: false,
    errorMsg: '',
    show: function() {
      this.visible = true;
      this.resetErrorState();
    },
    hide: function() {
      this.visible = false;
      this.resetErrorState();
    },
    save: function() {
      ic.metaForm.waiting = true;
      ic.image.metadata = this.data;
      Image.update({}, ic.image, function success(data){
        ic.metaForm.waiting = false;
        ic.metaForm.resetErrorState();
        ic.metaForm.hasSuccess = true;
        $log.debug("successfully updated image");
      }, function failure(errorResponse){
        ic.metaForm.resetErrorState();
        ic.metaForm.hasError = true;
        ic.metaForm.errorMsg = errorResponse;
        $log.debug("error updating image:", errorResponse);
      });
    },
    addRow: function() {
      this.data.push({ 'label': '', 'value': '' })
    },
    deleteRow: function(index) {
      this.data.splice(index, 1);
    },
    resetErrorState: function() {
      this.hasError = false;
      this.hasSuccess = false;
      this.errorMsg = '';
    }
  };
  
  // Update the form metadata when the current image changes
  $scope.$watch(function() {
    return ic.CourseCache.current_image.id;
  }, function(newVal, oldVal) {
    ic.metaForm.resetErrorState();
    ic.metaForm.data = ic.getImageMetadata();
  });
  
  // Update the current image index if/when the cache of images changes (i.e. loaded)
  $scope.$watch(function() {
    return ic.CourseCache.isLoadingImages.status;
  }, function(newVal, oldVal) {
    ic.updateImageIndex();
  });

}]);
