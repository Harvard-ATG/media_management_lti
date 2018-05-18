angular.module('media_manager')
.component('appCollectionEditManifest', {
  templateUrl: '/static/app/templates/collectionEditManifest.html',
  bindings: {
    onChange: '&',
    collection: '<'
  },
  controller: ['$log', 'Collection', function($log, Collection) {
      var ctrl = this;

      ctrl.save = function() {
        var data = {
          iiif_custom_manifest_url: ctrl.collection.iiif_custom_manifest_url || "",
          iiif_custom_canvas_id: ctrl.collection.iiif_custom_canvas_id || ""
        };

        $log.log("save manifest", data);
        ctrl.onChange({ '$event': data });
      };

      ctrl.$onInit = function() {
      };

      ctrl.$onChanges = function(changes) {
        $log.log("changes to manifest component", changes);
        if(changes.hasOwnProperty('collection') && !changes.collection.isFirstChange()) {
          ctrl.collection.iiif_custom_manifest_url = changes.collection.currentValue.iiif_custom_manifest_url;
          ctrl.collection.iiif_custom_canvas_id = changes.collection.currentValue.iiif_custom_canvas_id;
        }
      };
  }]
});