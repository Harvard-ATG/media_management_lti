angular.module('media_manager')
.component('appCollectionEditImages', {
  templateUrl: '/static/app/templates/collectionEditImages.html',
  bindings: {
    images: "<",
    isLoading: "<",
    isLibraryOpen: "<",
    onRemoveImage: "&",
    onChangeOrder: "&",
    onToggleLibrary: "&"
  },
  controller: ['$log', '$location', 'Collection', function($log, $location, Collection)  {
    var ctrl = this;
    var dragEnabled = true;

    ctrl.goToImageView = function(image) {
      $log.log('goToImageView', image);
      $location.path('/image/' + image.course_image_id);
    };

    ctrl.removeImage = function(image) {
      $log.log('removeImage', image);
      ctrl.onRemoveImage({ image: image });
    };

    ctrl.openOrCloseLibrary = function() {
      $log.log('openOrCloseLibrary', !ctrl.isLibraryOpen);
      ctrl.onToggleLibrary({ opened: !ctrl.isLibraryOpen });
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

        ctrl.onChangeOrder({ images: ctrl.images });
      }
    };

    ctrl.$onInit = function() {
      $log.log("initialize collectionEditImages");
      ctrl.libraryVisibility = false;
      ctrl.images = angular.copy(ctrl.images); // ensure we get our own copy
      $log.log("initializedc collectionEditImages", ctrl);
    };
  }]
});