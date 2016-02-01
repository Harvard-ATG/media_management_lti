angular.module('media_manager')
.factory('Course', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
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
.service('CourseCache', ['Course', 'AppConfig', function(Course, AppConfig){
  this.images = [];
  this.collections = [];
  this.loadImages = function() {
    if (this.images.length == 0) {
      this.images = Course.getImages({id: AppConfig.course_id});
    }

  };
  this.loadCollections = function() {
    if (this.collections.length == 0) {
      this.collections = Course.getCollections({id: AppConfig.course_id});
    }
  };
  this.load = function() {
    this.loadImages();
    this.loadCollections();
  };
  this.getCollectionById = function(id) {
    for (var i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) {
        return this.collections[i];
      }
    }
    return false;
  };
  this.getImageById = function(id){
    this.images.forEach(function(item){
      if(item.id == id){
        return item;
      }
    });
  };
}]);
