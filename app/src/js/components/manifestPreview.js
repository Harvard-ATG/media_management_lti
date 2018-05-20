angular.module('media_manager')
.component('appManifestPreview', {
  templateUrl: '/static/app/templates/manifestPreview.html',
  bindings: {
    manifestUrl: '<',
    canvasId: '<',
    onSelectCanvas: '&'
  },
  controller: ['$log', '$http', function($log, $http) {
    var ctrl = this;

    ctrl.validIiifManifest = function(manifest) {
      var m = manifest;
      if(!m.hasOwnProperty('sequences') || m.sequences.length < 1 || !m.sequences[0].hasOwnProperty('canvases')) {
        return false;
      }
      return true;
    };

    ctrl.validIiifCanvas = function(canvas) {
      if(!canvas.hasOwnProperty('images') || canvas.images.length < 1 || !canvas.images[0].hasOwnProperty('resource') || !canvas.images[0].resource.hasOwnProperty('service')) {
        return false;
      }
      return true;
    };

    ctrl.processCanvases = function(manifest, selectedCanvasId) {
      var canvases = manifest.sequences[0].canvases;
      return canvases.map(function(canvas, index) {
        if(!ctrl.validIiifCanvas(canvas)) {
          return false;
        }
        var iiif_base_uri = canvas.images[0].resource.service['@id'];
        if(!iiif_base_uri) {
          return false;
        }

        var image = {};
        image.url       = iiif_base_uri + '/full/100,/0/default.jpg';
        image.canvasId  = canvas['@id'];
        image.label     = canvas.label || 'Canvas #' + index;
        image.selected  = (selectedCanvasId && selectedCanvasId === canvas['@id']) ? true : false;

        return image;
      }).filter(function(image) {
        return image !== false;
      });
    };

    ctrl.handleManifestSuccess = function(response) {
      $log.log("handleManifestSuccess", response);
      if(response.status != 200) { return; }
      if(!ctrl.validIiifManifest(response.data)) {
        ctrl.error = "IIIF Manifest does not appear to have a sequence with canvases.";
        return false;
      }
      ctrl.manifest = response.data;
      ctrl.images = ctrl.processCanvases(ctrl.manifest, ctrl.canvasId);
      if(ctrl.images.length == 0) {
        ctrl.warning = "Manifest does not appear to have any images.";
      } else {
        ctrl.displayCurrentImages();
      }
      ctrl.isLoading = false;

      $log.log("handleManifestSuccess complete", ctrl);
    };

    ctrl.handleManifestError  = function(err) {
      $log.log("handleManifestError", err);
      ctrl.hasError = true;
      if(err.statusText < 0) {
        ctrl.error = "Failed to load manifest for preview:  " + err.statusText;
      } else {
        ctrl.error = "Failed to load manifest for preview.";
      }
      ctrl.isLoading = false;
    };

    ctrl.fetchManifest = function(url) {
      $log.log("fetchManifest", url);

      var config = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        cache: true
      };

      ctrl.isLoading = true;
      ctrl.resetErrors();
      $http.get(url, config)
        .then(ctrl.handleManifestSuccess)
        .catch(ctrl.handleManifestError);
    };

    ctrl.selectCanvas = function(image) {
      console.log("selected canvas", image.canvasId);
      if(image.canvasId == ctrl.canvasId) {
        ctrl.onSelectCanvas({ '$event': '' });
      } else {
        ctrl.onSelectCanvas({ '$event': image.canvasId });
      }
    };

    ctrl.displayNextImages = function() {
      ctrl.pageNum++;
      ctrl.displayCurrentImages();
    };

    ctrl.displayCurrentImages = function() {
      var start = 0;
      var end = ctrl.pageNum * ctrl.pageSize + ctrl.pageSize;
      if(end > ctrl.images.length) {
        end = ctrl.images.length;
      }
      ctrl.displayImages = ctrl.images.slice(start, end);
      ctrl.hasNextImages = (ctrl.images.length > ctrl.displayImages.length);
    };

    ctrl.resetErrors = function() {
      ctrl.hasError = false;
      ctrl.error = "";
    };

    ctrl.$onInit = function() {
      ctrl.hasError = false;
      ctrl.error = "";
      ctrl.images = null;
      ctrl.manifest = null;
      ctrl.displayImages = null;
      ctrl.pageNum = 0;
      ctrl.pageSize = 10;
      ctrl.isLoading = false;
      ctrl.fetchManifest(ctrl.manifestUrl);
    };

    ctrl.$onChanges = function(changes) {
      $log.log("manifestPreviewChanges", changes);
      if(changes.hasOwnProperty('manifestUrl') && !changes.manifestUrl.isFirstChange()) {
        ctrl.manifestUrl = changes.manifestUrl.currentValue;
        ctrl.fetchManifest(ctrl.manifestUrl);
      }
      if(changes.hasOwnProperty('canvasId') && !changes.canvasId.isFirstChange()) {
        ctrl.canvasId = changes.canvasId.currentValue;
        ctrl.images = ctrl.processCanvases(ctrl.manifest, ctrl.canvasId);
        ctrl.displayCurrentImages();
      }
    };
  }]
});