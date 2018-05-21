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

    ctrl.selectManifest = function() {
      ctrl.save();
      ctrl.showManifest();
    };

    ctrl.updateCanvas = function(canvasId) {
      ctrl.collection.iiif_custom_canvas_id = canvasId;
      ctrl.save();
      ctrl.showManifest();
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.showManifest = function() {
      ctrl.previewManifest = ctrl.collection.iiif_custom_manifest_url;
      ctrl.previewCanvas = ctrl.collection.iiif_custom_canvas_id;
      ctrl.previewEnabled = ctrl.previewManifest ? true : false;
    };

    ctrl.save = function() {
      var data = {
        iiif_custom_manifest_url: ctrl.collection.iiif_custom_manifest_url || "",
        iiif_custom_canvas_id: ctrl.collection.iiif_custom_canvas_id || ""
      };

      $log.log("save manifest", data);
      ctrl.onChange({ '$event': data });
    };

    ctrl.$onInit = function() {
      ctrl.previewEnabled = false;
      ctrl.hasManifest = (ctrl.collection.iiif_custom_manifest_url ? true : false);
      ctrl.showManifest();
    };

    ctrl.$onChanges = function(changes) {
      $log.log("collectionEditManifest changes", changes);
      if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
        ctrl.collection.iiif_custom_manifest_url = changes.collection.currentValue.iiif_custom_manifest_url;
        ctrl.collection.iiif_custom_canvas_id = changes.collection.currentValue.iiif_custom_canvas_id;
        ctrl.hasManifest = (ctrl.collection.iiif_custom_manifest_url ? true : false);
        ctrl.showManifest();
      }
    };
  }]
});