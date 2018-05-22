angular.module('media_manager')
.component('appCollectionEditManifest', {
  templateUrl: '/static/app/templates/collectionEditManifest.html',
  bindings: {
    collection: '<',
    onChange: '&',
    onOpen: '&'
  },
  controller: ['$log', function($log) {
    var ctrl = this;

    ctrl.selectCanvas = function(canvasId) {
      ctrl.canvasId = canvasId;
      ctrl.update();
    };

    ctrl.resetCanvas = function() {
      ctrl.canvasId = "";
    };

    ctrl.update = function() {
      ctrl.save();
      ctrl.showManifest();
    };

    ctrl.save = function() {
      var data = {"manifestUrl": ctrl.manifestUrl, "canvasId": ctrl.canvasId};
      ctrl.onChange({ '$event': data });
    };

    ctrl.showManifest = function() {
      ctrl.previewEnabled = !!ctrl.manifestUrl;
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.$onInit = function() {
      ctrl.previewEnabled = false;
      ctrl.manifestUrl = ctrl.collection.iiif_custom_manifest_url;
      ctrl.canvasId = ctrl.collection.iiif_custom_canvas_id;
      ctrl.showManifest();
    };

    ctrl.$onChanges = function(changes) {
      $log.log("collectionEditManifest changes", changes);
      var change;
      if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
        change = changes.collection;
        ctrl.manifestUrl = change.currentValue.iiif_custom_manifest_url;
        ctrl.canvasId = change.currentValue.iiif_custom_canvas_id;
        ctrl.showManifest();
      }
    };
  }]
});