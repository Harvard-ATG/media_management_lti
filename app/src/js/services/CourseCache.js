angular.module('media_manager')
.service('CourseCache', ['Course', 'AppConfig', 'Image', function(Course, AppConfig, Image){
  this.images = [];
  this.collections = [];
  this.current_image = null;
  this.isLoadingCollections = {"status": false, "msg": "Loading collections..."};
  this.isLoadingImages = {"status": false, "msg": "Loading images..."};
  this.isLoading = {"status": false, "msg": "Loading..."};
  this.error = {"message": ""};
  this.loaded = false;
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
      this.images.splice(remove_at_idx, 1);
      this.current_image = this.getPrevImage(image_id);
      return true;
    }
    return false;
  };
  this.setLoadingStatus = function(params) {
    if(params.hasOwnProperty("images")) {
      this.isLoadingImages.status = !!params.images;
    }
    if(params.hasOwnProperty("collections")) {
      this.isLoadingCollections.status = !!params.collections;
    }
    this.isLoading.status = this.isLoadingImages.status || this.isLoadingCollections.status;
    return this;
  };
  this.setError = function(params) {
    this.error.message = params.message || '';
  };
  this.updateCollectionOrder = function(sort_order) {
    return Course.updateCollectionOrder(sort_order).$promise;
  };
  this.loadImages = function() {
    var self = this;
    this.setLoadingStatus({ images: true });
    this.images = Course.getImages({id: AppConfig.course_id});
    this.images.$promise.then(function(images) {
      self.sortImages();
      if (self.current_image === null) {
        self.current_image = images[0];
      }
      self.setLoadingStatus({ images: false });
    }).catch(function(r) {
      console.log("Error loading images", r);
      self.setLoadingStatus({ images: false });
    });
    return this.images.$promise;
  }.bind(this);
  this.loadCollections = function() {
    var self = this;
	  this.setLoadingStatus({ collections: true });
    this.collections = Course.getCollections({id: AppConfig.course_id});
    this.collections.$promise.then(function(collections) {
      self.setLoadingStatus({ collections: false });
    }).catch(function(reason) {
      console.log("Error loading collections", reason);
      self.setLoadingStatus({ collections: false });
    });
    return this.collections.$promise;
  }.bind(this);
  this.load = function(errorCallback) {
    var self = this;
    if (!this.loaded) {
      this.loadImages().then(this.loadCollections).then(function() {
        self.loaded = true;
      }).catch(function(r) {
        self.loaded = false;
        self.setLoadingStatus({ images: false, collections: false });
        self.setError({ message: "Error loading data (Http code: " + r.status + ")" });
        if(errorCallback) {
          errorCallback(self.error);
        }
      });
    }
  }.bind(this);
  this.reload = function() {
    this.loaded = false;
    this.load();
  }.bind(this);
  this.getCollectionById = function(id) {
    for (var i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) {
        return this.collections[i];
      }
    }
    return false;
  };
  this.updateCollection = function(collection) {
    var cached_collection = this.getCollectionById(collection.id);
    if(cached_collection) {
       angular.copy(collection, cached_collection);
    }
  };
  this.getImageById = function(id){
    var that = this;
    if(that.images.length === 0){
      that.current_image = Image.get({id: id});
      that.load(); // load the rest of the images if they haven't been already
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
    if(this.images.length > 0){
      return this.images[0];
    } else {
      return null;
    }
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
