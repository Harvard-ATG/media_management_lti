angular.module('media_manager')
.service('Droplet', ['$timeout', 'AppConfig', function($timeout, AppConfig){
  var ds = this;
  ds.interface = {};
  ds.uploadCount = 0;
  ds.success = false;
  ds.error = false;
  ds.scope = undefined;

  // Listen for when the interface has been configured.
  ds.whenDropletReady = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);

      ds.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif']);
      ds.interface.setRequestUrl(request_url);
      ds.interface.setRequestHeaders({'Accept': 'application/json'})
      ds.interface.defineHTTPSuccess([/2.{2}/]);
      ds.interface.useArray(false);
      ds.interface.setPostData({"title": "Untitled"})
  };

  // Listen for when the files have been successfully uploaded.
  ds.onDropletSuccess = function(event, response, files) {
      ds.scope.uploadCount = files.length;
      ds.scope.success     = true;

      $timeout(function timeout() {
          ds.scope.success = false;
      }, 5000);

      console.log("droplet success", event, response, files);
      ds.scope.$broadcast('$dropletUploadComplete', response, files);
  };

  // Listen for when the files have failed to upload.
  ds.onDropletError = function(event, response) {
      console.log("onDropletError", event, response);
      ds.scope.error = true;

      $timeout(function timeout() {
          ds.scope.error = false;
      }, 5000);

      console.log("droplet error", event, response);
  };


}]);
