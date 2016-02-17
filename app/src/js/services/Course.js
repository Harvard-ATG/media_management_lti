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
  this.current_image = {};
  this.isLoadingCollections = {"status": false, "msg": "Loading collections..."};
  this.isLoadingImages = {"status": false, "msg": "Loading images..."};
  this.isLoading = {"status": false, "msg": "Loading..."};

  this.loadImages = function() {
    var self = this;
    this.isLoading.status = true;
    this.isLoadingImages.status = true;
    this.images = Course.getImages({id: AppConfig.course_id});
    this.images.$promise.then(function(images) {
      self.current_image = images[0];
      self.isLoadingImages.status = false;
      self.isLoading.status = false || self.isLoadingCollections.status;
    });
  };
  this.loadCollections = function() {
    var self = this;
    this.isLoading.status = true;
    this.isLoadingCollections.status = true;
    this.collections = Course.getCollections({id: AppConfig.course_id});
    this.collections.$promise.then(function(collections) {
      self.isLoadingCollections.status = false;
      self.isLoading.status = false || self.isLoadingImages.status;
    });
  };
  this.load = function() {
    if (this.images.length == 0) {
      this.loadImages();
    }
    if (this.collections.length == 0) {
      this.loadCollections();
    }
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
    var that = this;
    this.images.forEach(function(item){
      if(item.id == id){
        that.current_image = item;
      }
    });
    return that.current_image;
  };
  this.getPrevImage = function(image_id){
    for(var i = 0; i < this.images.length; i++){
      if(this.images[i].id == image_id){
        if(i > 0){
          return this.images[i-1];
        } else {
          return this.images[0];
        }
      }
    }
  };
}]);
