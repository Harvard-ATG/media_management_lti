angular.module("media_manager").component("appCollectionEdit",  {
    templateUrl: "/static/app/templates/collectionEdit.html",
    bindings: {
      "collectionId": "<"
    },
    controller: ["$log", "$location", "AppConfig", "CourseCache", "Notifications", "Collection", function($log, $location, AppConfig, CourseCache, Notifications, Collection) {
      var ctrl = this;

      ctrl.setLoading = function(key, inProgress, msg) {
        $log.debug("setLoading", key, inProgress, msg);
        if(!ctrl.loadingState.hasOwnProperty(key)) {
          ctrl.loadingState[key] = {status: false, msg: ""};
        }
        ctrl.loadingState[key].status = inProgress;
        ctrl.loadingState[key].msg = msg || "";
        if(inProgress) {
          ctrl.loadingCount++;
        } else {
          ctrl.loadingCount--;
        }
        ctrl.isLoading = ctrl.loadingCount > 0;
      };

      ctrl.getLoadingState = function(key) {
        return ctrl.loadingState[key] || {};
      };

      ctrl.setContentSource = function(source) {
        console.log(source);
        if(["images","custom"].indexOf(source) < 0) {
          throw new Error("invalid content source: "+source);
        }
        ctrl.contentSource = source;
        ctrl.isContentImages = (source === "images");
        ctrl.isContentManifest = (source === "custom");
      };

      ctrl.setContentToImages = function() {
        $log.debug("setContentToImages");
        ctrl.setContentSource('images');
        ctrl.collection.iiif_source = "images";
        ctrl.saveCollection('Collection will use your images');
      };
      ctrl.setContentToManifest = function() {
        $log.debug("setContentToManifest");
        ctrl.setContentSource('custom');
        ctrl.collection.iiif_source = "custom";
        ctrl.saveCollection('Collection will use the IIIF manifest');
      };

      ctrl.getCollection = function(collectionId) {
        $log.debug("getCollection", collectionId);
        if(!collectionId) {
          throw new Error("Invalid collectionId passed to getCollection()")
        }
        ctrl.setLoading("loadcollection", true, "Loading collection...");
        var collection = Collection.get({id: collectionId});
        collection.$promise.then(function(collection) {
          collection.images.sort(function(a, b){
            var x = a['sort_order'];
            var y = b['sort_order'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
          ctrl.setContentSource(collection.iiif_source);
          ctrl.setLoading("loadcollection", false);
        });
        return collection;
      };

      ctrl.saveCollection = function(message){
        return ctrl.updateCollection(message);
      };

      ctrl.updateCollection = function(message) {
        message = message || "Collection saved.";
        var collectionId = ctrl.collection.id;
        $log.log("updateCollection", collectionId, message);

        ctrl.collection.course_image_ids = ctrl.collection.images.map(function(image) {
          // images could come from the image library, or already be part of the collection
          // and we want to make sure we're returning the image "id" property, not the collectionimage "id"
          var image_prop_for = {
            "collectionimages": "course_image_id",
            "images": "id"
          };
          return image[image_prop_for[image.type]];
        });

        ctrl.setLoading("savecollection", true, "Saving collection...");

        return Collection.update({}, ctrl.collection, function(data){
          ctrl.notifications.clear();
          CourseCache.updateCollection(ctrl.collection);
        }, function(errorResponse) {
          $log.error("Failed to update collection:", errorResponse);
          ctrl.notifications.error("Failed to update collection.");
        }).$promise.then(function(data) {
          $log.log("Collection successfully updated: ", data);
          ctrl.notifications.success(message);
        }).finally(function() {
          ctrl.setLoading("savecollection", false);
        });
      };

      ctrl.addCourseImageToCollection = function(courseImage){
        $log.debug("addCollectionImage", courseImage);
        ctrl.collection.images.push(courseImage);
        ctrl.collection.images = ctrl.collection.images.slice(0); // break old reference so child component gets change
        ctrl.saveCollection("Image added to collection: " + courseImage.title);
      };

      ctrl.removeCollectionImage = function(collectionImage){
        $log.debug("removeCollectionImage", collectionImage);

        // note this needs to be a forEach/search instead of a splice because
        // ng-sortable won't work with "track by $index" enabled on the ng-repeat
        // https://github.com/a5hik/ng-sortable/issues/221
        ctrl.collection.images.some(function(item, index, arr){
          if(item.id == collectionImage.id){
            ctrl.collection.images.splice(index, 1);
            ctrl.collection.images = ctrl.collection.images.slice(0); // break old reference so child component gets change
            ctrl.saveCollection("Image removed from collection: " + item.title);
            return true;
          }
        });
      };

      ctrl.updateCollectionOrder = function(reorderedImages) {
        $log.debug("updateCollectionOrder", reorderedImages);
        ctrl.collection.images = reorderedImages.slice(0);
        ctrl.saveCollection("Collection order saved");
      };

      ctrl.updateManifest = function(data) {
        ctrl.collection.iiif_custom_manifest_url = data.iiif_custom_manifest_url || "";
        ctrl.collection.iiif_custom_canvas_id = data.iiif_custom_canvas_id || "";
        ctrl.saveCollection();
      };

      ctrl.updateCollectionInfo = function() {
        console.log("updateCollectionInfo");
        var title = ctrl.collection.title.trim();
        if(title !== "") {
          ctrl.saveCollection("Saved collection information");
        }
      };

      ctrl.cancelCollection = function() {
        $location.path('/collections/');
      };

      ctrl.openCollection = function() {
        $location.path('/mirador/' + ctrl.collectionId);
      };

      // Component Lifecycle
      ctrl.$onInit = function() {
        ctrl.initialized = false;
        ctrl.notifications = Notifications;
        ctrl.courseImages  = CourseCache.images;
        ctrl.courseCollections  = CourseCache.collections;
        ctrl.loadingCount = 0;
        ctrl.loadingState = {};
        ctrl.isLoading = false;
        ctrl.contentSource = null;
        ctrl.isContentImages = false;
        ctrl.isContentManifest = false;

        var collection = ctrl.getCollection(ctrl.collectionId);
        collection.$promise.then(function() {
          ctrl.collection = collection; // wait to update controller scope until the collection is done loading
          ctrl.initialized = true;
          ctrl.setContentSource(ctrl.collection.iiif_source);
        }).catch(function() {
          ctrl.notifications.error("Error loading collection: " + ctrl.collectionId);
        });

        $log.debug("initialized collectionEdit", ctrl);
      };

    }]
});