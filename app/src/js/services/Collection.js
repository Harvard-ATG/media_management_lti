angular.module('media_manager')
.factory('Collection', ['$resource', function($resource){
  var host = 'http://localhost:8000';
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
angular.module('media_manager')
.service('CollectionCache', [function(){
  this.collections = [];
  this.current = {id: null};
}]);
