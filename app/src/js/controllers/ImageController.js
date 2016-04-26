angular.module('media_manager')
.controller('ImageController', ['$routeParams', 'CourseCache', 'ImageBehavior', 'Breadcrumbs', '$location', '$scope', '$log', 'Image', function($routeParams, CourseCache, ImageBehavior, Breadcrumbs, $location, $scope, $log, Image){
  var ic = this;

  Breadcrumbs.addCrumb("Edit Image");
  
  ic.ImageBehavior = ImageBehavior;
  ic.Image = Image;
  ic.CourseCache = CourseCache;
  ic.current_image = CourseCache.getImageById($routeParams.imageId);
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
  
  ic.initializeImageIndex = function() {
    var images = CourseCache.images;
    for(var index = 0, img = null, len = images.length; index < len; index++) {
      img = images[index];
      if(img.id == $routeParams.imageId){
        ic.index = index;
        ic.current_image = img;
        break;
      }
    }
  };

  ic.next = function($event){
    $event.preventDefault();
    if(ic.index + 1 < CourseCache.images.length){
      ic.index++;
      ic.current_image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
    }
  };

  ic.prev = function($event){
    $event.preventDefault();
    if(ic.index > 0){
      ic.index--;
      ic.current_image = CourseCache.images[ic.index];
      CourseCache.current_image = CourseCache.images[ic.index];
    }
  };

  ic.save = function(){
    var image = ic.current_image;
    if (!image) {
      $log.error("error saving image -- not defined!")
      return false;
    }

    Image.update({}, image, function success(data){
      $log.debug("saved image", data);
    }, function failure(errorResponse) {
      $log.debug("error updating image:", errorResponse);
    });

    return true;
  };

  ic.deleteImage = function(){
    ic.ImageBehavior.deleteImageModal(ic.current_image.id).then(function(){
      if(ic.CourseCache.images.length == 0){
        $location.path(Breadcrumbs.crumbs[Breadcrumbs.crumbs.length - 2].route);
      } else {
        if(ic.index == ic.CourseCache.images.length){
          ic.index--;
        } else if(ic.index < 0){
          ic.index = 0;
        }
        ic.current_image = CourseCache.images[ic.index];
        CourseCache.current_image = CourseCache.images[ic.index];
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
    var image_metadata = ic.current_image.metadata;
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
    errorMsg: '',
    show: function() {
      this.visible = true;
      this.resetErrorState();
    },
    hide: function() {
      this.visible = false;
      this.resetErrorState();
    },
    cancel: function() {
      this.data = ic.getImageMetadata();
      this.hide();
    },
    save: function() {
      ic.metaForm.waiting = true;
      ic.current_image.metadata = this.data;
      Image.update({}, ic.current_image, function success(data){
        ic.metaForm.resetErrorState();
        ic.metaForm.waiting = false;
        ic.metaForm.hide();
        $log.debug("successfully updated image");
      }, function failure(errorResponse){
        ic.metaForm.resetErrorState();
        ic.metaForm.waiting = false;
        ic.metaForm.errorMsg = errorResponse;
        ic.metaForm.hasError = true;
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
      this.errorMsg = '';
    }
  };
  
  // Update the form metadata when the current image changes
  $scope.$watch(function() {
    return ic.CourseCache.current_image ? ic.CourseCache.current_image.id : null;
  }, function(newVal, oldVal) {
    if (newVal != oldVal && newVal !== null) {
      ic.metaForm.resetErrorState();
      ic.metaForm.data = ic.getImageMetadata();
    }
  });
  
  // Update the current image index if/when the cache of images changes (i.e. loaded)
  $scope.$watch(function() {
    return ic.CourseCache.isLoadingImages.status;
  }, function(newVal, oldVal) {
    ic.initializeImageIndex();
  });

}]);
