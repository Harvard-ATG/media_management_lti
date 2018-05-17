angular.module('media_manager')
.component('appCollectionEditManifest', {
  templateUrl: '/static/app/templates/collectionEditManifest.html',
  bindings: {
    collection: '='
  },
  controller: ['Collection', function(Collection) {
      var ctrl = this;
      ctrl.useCustomManifest = ctrl.collection.custom_iiif_manifest_url ? true : false;
      ctrl.save = function() {
        console.log("save manifest settings");
      };
  }]
});