angular.module('media_manager')
.factory('Collection', ['$resource',  'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  return $resource(host + '/collections/:id', { id: '@id' }, {
      'get': {
        method: 'GET',
        headers: headers,
        url: host + '/collections/:id'
      },
      'update': {
        method: 'PUT',
        headers: headers,
        url: host + '/collections/:id'
      },
      'save': {
        method: 'POST',
        headers: headers,
        url: host + '/collections/:id'
      },
      'delete': {
        method: 'DELETE',
        headers: headers,
        url: host + '/collections/:id'
      },
      'saveImages': {
        method: 'POST',
        headers: headers,
        url: host + '/collections/:id/images',
        isArray: true
      }
    }
  );
}]);
