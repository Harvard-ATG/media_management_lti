angular.module('media_manager')
.component('appCollectionEditImages', {
  templateUrl: '/static/app/templates/collectionEditImages.html',
  bindings: {
    images: "<",
    isLoading: "<",
    onRemoveImage: "&",
    onChangeOrder: "&",
    onOpen: "&"
  },
  controller: ['$log', '$location', function($log, $location)  {
    var ctrl = this;
    var dragEnabled = true;

    ctrl.goToImageView = function(image) {
      $log.log('goToImageView', image);
      $location.path('/image/' + image.course_image_id);
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.removeImage = function(image) {
      $log.log('removeImage', image);
      ctrl.onRemoveImage({ '$event': image });
    };

    ctrl.dragControlListeners = {
      accept: function(sourceItemHandleScope, destSortableScope){
        return dragEnabled;
      },
      orderChanged: function(event){
        dragEnabled = false;

        var updates = [];
        ctrl.images.forEach(function(item, index, arr){
          var newsort = index + 1;
          ctrl.images[index].sort_order = newsort;
        });
        dragEnabled = true;

        ctrl.onChangeOrder({ '$event': ctrl.images });
      }
    };

    // Component Lifecycle
    ctrl.$onInit = function() {
      ctrl.images = angular.copy(ctrl.images); // ensure we get our own copy
      $log.log("initialized collectionEditImages", ctrl);
    };

    ctrl.$onChanges = function(changes) {
      console.log("appCollectionEditImages detected changes", changes);
      if(changes.hasOwnProperty('isLoading')) {
        ctrl.isLoading = changes.isLoading.currentValue;
      }
      if(changes.hasOwnProperty('images')) {
        ctrl.images = angular.copy(changes.images.currentValue);
      }
    };

  }]
});