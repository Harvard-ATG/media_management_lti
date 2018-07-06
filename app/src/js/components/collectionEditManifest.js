angular.module('media_manager')
.component('appCollectionEditManifest', {
  templateUrl: '/static/app/templates/collectionEditManifest.html',
  bindings: {
    collection: '<',
    onChange: '&',
    onOpen: '&',
    onError: '&'
  },
  controller: ['$log', function($log) {
    var ctrl = this;

    ctrl.validateManifest = function() {
      ctrl.hasError = false;
      ctrl.errorMsg = "";
      var isEmpty = ctrl.manifestUrl.trim() === "";
      var isHttps = /^https:\/\/[^/]+/.test(ctrl.manifestUrl);
      if(!isEmpty && !isHttps) {
        ctrl.errorMsg = "The manifest URL must start with https://";
        ctrl.hasError = true;
      }
      ctrl.preview();
      ctrl.onError({ '$event': ctrl.hasError });
    };

    ctrl.selectManifest = function() {
      ctrl.canvasId = "";
      ctrl.update();
    };

    ctrl.selectCanvas = function(canvasId) {
      ctrl.canvasId = canvasId;
      ctrl.update();
    };

    ctrl.update = function() {
      ctrl.save();
      ctrl.preview();
    };

    ctrl.save = function() {
      var data = {"manifestUrl": ctrl.manifestUrl, "canvasId": ctrl.canvasId};
      ctrl.onChange({ '$event': data });
    };

    ctrl.preview = function() {
      ctrl.previewEnabled = (ctrl.manifestUrl !== "" && !ctrl.hasError);
    };

    ctrl.openCollection = function() {
      ctrl.onOpen();
    };

    ctrl.$onInit = function() {
      ctrl.previewEnabled = false;
      ctrl.hasError = false;
      ctrl.errorMsg = "";
      ctrl.manifestUrl = ctrl.collection.iiif_custom_manifest_url;
      ctrl.canvasId = ctrl.collection.iiif_custom_canvas_id;
      ctrl.preview();
    };

    ctrl.$onChanges = function(changes) {
      $log.log("collectionEditManifest changes", changes);
      var change;
      if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
        change = changes.collection;
        ctrl.manifestUrl = change.currentValue.iiif_custom_manifest_url;
        ctrl.canvasId = change.currentValue.iiif_custom_canvas_id;
        ctrl.preview();
      }
    };
  }]
});