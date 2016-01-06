angular.module('media_manager')
.factory('Course', ['$resource', function($resource){
  var host = 'http://localhost:8000';
  return $resource(host + '/courses/:id',
    { id: '@id', image_id: '@image_id', collection_id: '@collection_id' }, {
      'getImages': {
        method: 'GET',
        isArray: true,
        url: host + '/courses/:id/images/:image_id'
      },
      'getCollections': {
        method: 'GET',
        isArray: true,
        url: host + '/courses/:id/collections/:collection_id'
      }
    }
  );
}]);
angular.module('media_manager')
.service('ImageCache', [function(){
  this.images = [];
}]);
