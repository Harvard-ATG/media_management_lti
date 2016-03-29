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
.service('CourseCache', ['Course', 'AppConfig', 'Image', function(Course, AppConfig, Image){
  this.images = [];
  this.collections = [];
  this.current_image = {};
  this.isLoadingCollections = {"status": false, "msg": "Loading collections..."};
  this.isLoadingImages = {"status": false, "msg": "Loading images..."};
  this.isLoading = {"status": false, "msg": "Loading..."};
  this.compareImages = null;
  this.sortType = null;

  this.addImage = function(image_object) {
    this.images.push(image_object);
    this.sortImages();
  };
  this.removeImage = function(image_id) {
    var remove_at_idx = -1;
    for(var i = 0, images = this.images, len = this.images.length; i < len; i++) {
        if (images[i].id == image_id) {
            remove_at_idx = i;
            break;
        }
    }
    if (remove_at_idx >= 0) {
        this.current_image = this.getPrevImage(image_id);
        this.images.splice(remove_at_idx, 1);
        return true;
    }
    return false;
  };
  this.loadImages = function() {
    var self = this;
    this.isLoading.status = true;
    this.isLoadingImages.status = true;
    this.images = Course.getImages({id: AppConfig.course_id});
    this.images.$promise.then(function(images) {
      self.sortImages();
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
    if(that.images.length === 0){
      that.current_image = Image.get({id: id});
    }
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
    return null;
  };
  this.updateSort = function(sortType, sortDir) {
    var make_numeric_compare = function(prop, dir) {
      return function(a, b) {
        var a_num = Number(a[prop]);
        var b_num = Number(b[prop]);
        if (isNaN(a_num) || isNaN(b_num)) {
          return 0;
        }
        return dir ? a_num - b_num : b_num - a_num;
      };
    };
    var make_date_compare = function(prop, dir) {
      return function(a, b) {
        var a_date = Date.parse(a[prop]);
        var b_date = Date.parse(b[prop]);
        if (isNaN(a_date) || isNaN(b_date)) {
          return 0;
        }
        return dir ? a_date - b_date : b_date - a_date;
      };
    };
    var make_str_compare = function(prop, dir) {
      return function(a, b) {
        var a_str = a[prop].toLowerCase().trim();
        var b_str = b[prop].toLowerCase().trim();
        if (a_str == b_str) {
          return 0;
        }
        return dir ? (a_str < b_str ? -1 : 1) : (b_str < a_str ? -1 : 1);
      };
    };
    var lookup_sort = {
      "created": function(dir) {
        return make_date_compare("created", dir);
      },
      "updated": function(dir) {
        return make_date_compare("updated", dir);
      },
      "title": function(dir) {
        return make_str_compare("title", dir);
      },
      "sort_order": function(dir) {
        return make_numeric_compare("sort_order", dir);
      }
    };

    if (!lookup_sort.hasOwnProperty(sortType)) {
      throw "Invalid sort type: " + sortType;
    }
    if (sortDir != "asc" && sortDir != "desc") {
      throw "Invalid sort dir: " + sortDir;
    }

    this.sortType = sortType;
    this.compareImages = lookup_sort[sortType](sortDir == "asc" ? true : false);


    return this;
  };
  this.sortImages = function() {
    var compare = this.compareImages;
    if (compare) {
      this.images.sort(compare);
    }
  };
}]);
