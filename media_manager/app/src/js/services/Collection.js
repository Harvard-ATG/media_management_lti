angular.module('media_manager')
.factory('Collection', ['$resource', function($resource){
  var host = 'http://localhost:8000';
  return $resource(host + '/collections/:id',
    { id: '@id' }, {
      'saveImages': {
        method: 'POST',
        url: host + '/collections/:id/images',
        isArray: true
      }
    }
  );
}]);
