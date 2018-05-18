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
          custom_iiif_manifest_url: ctrl.collection.custom_iiif_manifest_url || "",
          custom_iiif_canvas_id: ctrl.collection.custom_iiif_canvas_id || ""
        };

        $log.log("save manifest", data);
        ctrl.onChange({ data: data });
      };

      ctrl.$onInit = function() {
      };

      ctrl.$onChanges = function(changes) {
        console.log("changes to manifest component", changes);
        ctrl.collection.custom_iiif_manifest_url = changes.collection.currentValue.custom_iiif_manifest_url;
        ctrl.collection.custom_iiif_canvas_id = changes.collection.currentValue.custom_iiif_canvas_id;
      };
  }]
});