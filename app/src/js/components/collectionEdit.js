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

      ctrl.isContentImages = function() {
        return ctrl.contentChoice === "I";
      };
      ctrl.isContentManifest = function() {
        return ctrl.contentChoice === "M";
      };
      ctrl.setContentToImages = function() {
        $log.debug("setContentToImages");
        ctrl.contentChoice = "I";
      };
      ctrl.setContentToManifest = function() {
        $log.debug("setContentToManifest");
        ctrl.contentChoice = "M";
        ctrl.toggleLibrary(false);
      };

      ctrl.toggleLibrary = function(opened) {
        $log.debug("toggleLibrary", opened);
        ctrl.libraryOpened = opened;
        ctrl.libraryClosed = !opened;
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
          if(collection.custom_iiif_manifest_url) {
            ctrl.setContentToManifest();
          } else {
            ctrl.setContentToImages();
          }
          ctrl.setLoading("loadcollection", false);
        });
        return collection;
      };

      ctrl.getNewCollection = function() {
        var collection = new Collection();
        collection.images = [];
        collection.title = "Untitled Collection";
        return collection;
      };

      ctrl.saveCollection = function(message){
        if(ctrl.collectionId){
          return ctrl.updateCollection(message);
        } else {
          return ctrl.createCollection();
        }
      };

      ctrl.updateCollection = function(message) {
        var collectionId = ctrl.collection.id;
        $log.debug("updateCollection", collectionId, message);

        ctrl.collection.course_image_ids = ctrl.collection.images.map(function(image) {
          // images could come from the image library, or already be part of the collection
          // and we want to make sure we're returning the image "id" property, not the collectionimage "id"
          var image_prop_for = {
            "collectionimages": "course_image_id",
            "images": "id"
          };
          return image[image_prop_for[image.type]];
        });

        // PUT to update collection
        ctrl.setLoading("savecollection", true, "Saving collection...");

        return Collection.update({}, ctrl.collection, function(data){
          ctrl.notifications.clear();
          var collection = ctrl.getCollection(collectionId);
          ctrl.setLoading("loadcollection", true, "Loading collection...");
          collection.$promise.then(function(collection) {
            angular.copy(ctrl.collection, collection); // copy because we don't want to change the object reference to ctrl.collection

            // update the CourseCache.collections since it is stale
            var collection_idx = ctrl.courseCollections.map(function(c) { return c.id; }).indexOf(collection.id);
            if (collection_idx >= 0) {
              ctrl.courseCollections.splice(collection_idx, 1, collection);
            }
            $log.debug("insert updated collection into cache at index: ", collection_idx);
          }, function(response) {
            ctrl.notifications.error("Error loading collection: " + response);
          }).finally(function() {
            ctrl.setLoading("loadcollection", false, "Loading collection...");
          });

        }, function(errorResponse) {
          $log.debug("Error updating collection:", errorResponse);
          ctrl.notifications.error("Error updating collection: " + errorResponse);
        }).$promise.then(function(data) {
          $log.debug("Collection updated: ", data)
          if(!message){
            message = "Collection saved.";
          }
          ctrl.notifications.success(message);
        }).finally(function() {
          ctrl.setLoading("savecollection", false);
        });
      };

      ctrl.createCollection = function() {
        $log.debug("createCollection");
        ctrl.collection.course_id = AppConfig.course_id;
        ctrl.collection.course_image_ids = ctrl.collection.images.map(function(image){
          return image.id;
        });

        // post to save a new collection
        return Collection.save({}, ctrl.collection, function(data){
          ctrl.collection.id = data.id;
          ctrl.courseCollections.push(Collection.get({id: data.id }));
          $location.path('/workspace/'+data.id);
        });
      };

      ctrl.addCourseImageToCollection = function(courseImage){
        $log.debug("addCollectionImage", courseImage);
        ctrl.collection.images.push(courseImage);
        ctrl.saveCollection(courseImage.title + " added to collection.");
      };

      ctrl.removeCollectionImage = function(collectionImage){
        $log.debug("removeCollectionImage", collectionImage);

        // note this needs to be a forEach/search instead of a splice because
        // ng-sortable won't work with "track by $index" enabled on the ng-repeat
        // https://github.com/a5hik/ng-sortable/issues/221
        ctrl.collection.images.some(function(item, index, arr){
          if(item.id == collectionImage.id){
            ctrl.collection.images.splice(index, 1);
            ctrl.saveCollection(item.title + " removed from collection.");
            return true;
          }
        });
      };

      ctrl.updateCollectionOrder = function(reorderedImages) {
        $log.debug("updateCollectionOrder", reorderedImages);

        var images = ctrl.collection.images;

        // clear array, preserving reference
        images.splice(0, images.length);

        // add the reordered images back to the array
        for(var i = 0; i < reorderedImages.length; i++) {
          images.push(reorderedImages[i]);
        }
      };

      ctrl.cancelCollection = function() {
        $location.path('/collections/');
      };

      ctrl.$onInit = function() {
        $log.debug("initialize collectionEdit");
        ctrl.notifications = Notifications;
        ctrl.courseImages  = CourseCache.images;
        ctrl.courseCollections  = CourseCache.collections;
        ctrl.loadingCount = 0;
        ctrl.loadingState = {};
        ctrl.isLoading = false;
        ctrl.libraryOpened = false;
        ctrl.libraryClosed = !ctrl.libraryOpened;
        ctrl.contentChoice = "I";

        if(ctrl.collectionId) {
          ctrl.collection = ctrl.getCollection(ctrl.collectionId);
        } else {
          ctrl.collection = ctrl.getNewCollection();
        }

        $log.debug("initializedc collectionEdit", ctrl);
      };
    }]
});