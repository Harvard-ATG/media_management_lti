angular.module('media_manager')
.service('Droplet', ['$timeout', function($timeout){
  var ds = this;

  ds.interface = {};
  ds.uploadCount = 0;
  ds.success = false;
  ds.error = false;
  ds.scope = undefined;


  // Listen for when the interface has been configured.
  ds.whenDropletReady = function() {

      ds.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
      ds.interface.setRequestUrl('http://localhost:8000/courses/1/images');
      ds.interface.defineHTTPSuccess([/2.{2}/]);
      ds.interface.useArray(false);

  };

  // Listen for when the files have been successfully uploaded.
  ds.onDropletSuccess = function(event, response, files) {

      ds.scope.uploadCount = files.length;
      ds.scope.success     = true;

      $timeout(function timeout() {
          ds.scope.success = false;
      }, 5000);

      console.log("done uploading");

  };

  // Listen for when the files have failed to upload.
  ds.onDropletError = function(event, response) {

      ds.scope.error = true;

      $timeout(function timeout() {
          ds.scope.error = false;
      }, 5000);

      console.log("error!");

  };


}]);
