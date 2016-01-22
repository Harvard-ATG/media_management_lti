angular.module('media_manager')
.factory('Collection', ['$resource',  'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  return $resource(host + '/collections/:id',
    { id: '@id' }, {
      'saveImages': {
        method: 'POST',
        url: host + '/collections/:id/images',
        isArray: true
      },
      'update': {
        method:'PUT'
      }
    }
  );
}]);