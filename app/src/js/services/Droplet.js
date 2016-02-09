angular.module('media_manager')
.service('Droplet', ['$timeout', 'AppConfig', function($timeout, AppConfig){
  var ds = this;
  
  ds.allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
  
  ds.requestHeaders = {
    'Accept': 'application/json',
    'Authorization': AppConfig.authorization_header
  };

  // Returns the image upload URL.
  ds.getUploadUrl = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);
      return request_url;
  };
  
  // Configures the Droplet *interface* with necessary settings.
  ds.configure = function(dropletInterface) {
    dropletInterface.allowedExtensions(ds.allowedExtensions);
    dropletInterface.setRequestUrl(ds.getUploadUrl());
    dropletInterface.setRequestHeaders(ds.requestHeaders);
    dropletInterface.defineHTTPSuccess([/2.{2}/]);
    dropletInterface.useArray(false);
    dropletInterface.setPostData({"title": "Untitled"})
    return dropletInterface;
  };

}]);
