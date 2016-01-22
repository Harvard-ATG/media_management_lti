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
.service('CourseCache', ['Course', 'AppConfig', function(Course, AppConfig){
  this.images = [];
  this.collections = [];
  this.currentCollection = {id:null};

  this.addImage = function(image) {
    this.images.push(image)
  };

  this.loadImages = function() {
    if(this.images.length === 0){
      this.images = Course.getImages({id: AppConfig.course_id});
    }
  };
  
  this.loadCollections = function() {
    if(this.collections.length === 0){
      this.collections = Course.getCollections({id: AppConfig.course_id});
    }
  };
}]);
