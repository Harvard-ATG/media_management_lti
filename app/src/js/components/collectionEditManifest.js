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
      ctrl.openPreview();
    };

    ctrl.updateCanvas = function(canvasId) {
      ctrl.collection.iiif_custom_canvas_id = canvasId;
      ctrl.save();
      ctrl.openPreview();
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.openPreview = function() {
      ctrl.previewManifest = ctrl.collection.iiif_custom_manifest_url;
      ctrl.previewCanvas = ctrl.collection.iiif_custom_canvas_id;
      ctrl.showPreview = true;
    };

    ctrl.closePreview = function() {
      ctrl.showPreview = false;
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
      ctrl.previewUrl = "";
      ctrl.showPreview = false;
      ctrl.canOpenManifest = (ctrl.collection.iiif_custom_manifest_url ? true : false);;
    };

    ctrl.$onChanges = function(changes) {
      if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
        ctrl.canOpenManifest = (ctrl.collection.iiif_custom_manifest_url ? true : false);
        ctrl.collection.iiif_custom_manifest_url = changes.collection.currentValue.iiif_custom_manifest_url;
        ctrl.collection.iiif_custom_canvas_id = changes.collection.currentValue.iiif_custom_canvas_id;
      }
    };
  }]
});