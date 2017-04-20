angular.module('media_manager')
.factory('Image', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  return $resource(host + '/images/:id',
    { id: '@id'}, {
      'update': {
        method:'PUT',
        headers: headers
      }
    }
  );
}]);
