angular.module('media_manager')
.component('appManifestPreview', {
  templateUrl: '/static/app/templates/manifestPreview.html',
  bindings: {
    manifestUrl: '<',
    canvasId: '<',
    onSelectCanvas: '&'
  },
  controller: ['$log', '$http', '$window', function($log, $http, $window) {
    var ctrl = this;

    ctrl.validIiifManifest = function(manifest) {
      var m = manifest;
      if(!m.hasOwnProperty('@id') || !m.hasOwnProperty('@context') || !m.hasOwnProperty('label')) {
        return false;
      }
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
        image.thumbUrl  = iiif_base_uri + '/full/100,/0/default.jpg';
        image.largeUrl  = iiif_base_uri + '/full/pct:50/0/default.jpg';
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

      var contentType = response.headers('Content-Type');
      if(contentType.indexOf('json') === -1) {
        return ctrl.reportError('invalidContentType', contentType);
      }
      if(!ctrl.validIiifManifest(response.data)) {
        return ctrl.reportError('invalidManifestJson');
      }

      ctrl.manifest = response.data;
      ctrl.images = ctrl.processCanvases(ctrl.manifest, ctrl.canvasId);
      ctrl.displayCurrentImages();

      return true;
    };

    ctrl.handleManifestError  = function(err) {
      if(err.status <= 0) {
        ctrl.reportError('httpNotAvailableError');
      } else {
        ctrl.reportError('httpResponseError', err);
      }
      return false;
    };

    ctrl.reportError = function(code, err) {
      $log.log("reportError", code, err);
      ctrl.hasError = true;
      switch(code) {
        case 'invalidContentType':
          var contentType = err;
          ctrl.errorMsg = "The content type is not valid [" + contentType + "]. Expected a JSON document.";
          break;
        case 'invalidManifestJson':
          ctrl.errorMsg = 'The JSON document does not appear to be a IIIF-compliant manifest as described by http://iiif.io/api/presentation/2.1/#manifest';
          break;
        case 'httpResponseError':
          ctrl.errorMsg = "The HTTP request failed to load manifest for preview. " + (err.statusText ? 'Status: ' + err.statusText : '');
          break;
        case 'httpNotAvailableError':
          ctrl.errorMsg = "The HTTP request failed. Timed out or missing/misconfigured CORS HTTP headers.";
          break;
        default:
          ctrl.errorMsg = "Failed to load manifest. Reason unknown.";
          break;
      }
      return false;
    };

    ctrl.fetchManifest = function(url) {
      $log.log("fetchManifest", url);

      var config = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/ld+json'
        },
        cache: true,
        timeout: 5000
      };

      ctrl.resetErrors();
      ctrl.isLoading = true;
      $http.get(url, config)
        .then(ctrl.handleManifestSuccess, ctrl.handleManifestError)
        .then(ctrl.resetLoading, ctrl.resetLoading)
    };

    ctrl.selectCanvas = function(image) {
      if(image.canvasId == ctrl.canvasId) {
        ctrl.onSelectCanvas({ '$event': '' });
      } else {
        ctrl.onSelectCanvas({ '$event': image.canvasId });
      }
    };

    ctrl.openLargeImage = function(image) {
      $window.open(image.largeUrl, image.label, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
    };

    ctrl.displayNextImages = function(pageSize) {
      if(typeof pageSize == 'number' && pageSize >= 0) {
        ctrl.pageSize = pageSize;
      }
      ctrl.pageEnd += ctrl.pageSize;
      ctrl.displayCurrentImages();
    };

    ctrl.displayCurrentImages = function() {
      var start = 0;
      var end = ctrl.pageEnd;
      if(end > ctrl.images.length) {
        end = ctrl.images.length;
      }
      ctrl.displayImages = ctrl.images.slice(start, end);
      ctrl.hasNextImages = (ctrl.images.length > ctrl.displayImages.length);
      ctrl.pageEnd = end;
    };

    ctrl.resetErrors = function() {
      ctrl.hasError = false;
      ctrl.error = "";
      return ctrl;
    };

    ctrl.resetLoading = function() {
      ctrl.isLoading = false;
      return ctrl;
    };

    ctrl.$onInit = function() {
      ctrl.hasError = false;
      ctrl.error = "";
      ctrl.images = null;
      ctrl.manifest = null;
      ctrl.displayImages = null;
      ctrl.pageSize = 10;
      ctrl.pageEnd = ctrl.pageSize;
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