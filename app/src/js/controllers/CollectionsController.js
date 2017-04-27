angular.module('media_manager').controller('CollectionsController', [
    '$scope',
    'CourseCache',
    'CourseModuleService',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    'Notifications',
    'Collection',
    '$q',
    '$http',
    function(
    $scope,
    CourseCache,
    CourseModuleService,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs,
    Notifications,
    Collection,
    $q,
    $http) {
        var lc = this;

        CourseCache.load();
        Breadcrumbs.home();

        lc.CourseCache = CourseCache;
        lc.notifications = Notifications;
        lc.error = lc.CourseCache.error;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        lc.isPrimaryCollection = function(collection_id) {
          return CourseModuleService.isPrimary(collection_id);
        };

        lc.setPrimaryCollection = function(collection_id) {
          CourseModuleService.updateModuleCollection(collection_id).then(function successCallback(response) {
            lc.notifications.success("Successfully updated primary collection");
          }, function errorCallback(response) {
            lc.notifications.error("Failure. Primary collection not updated ("+response.status+")");
          });
        };

        lc.dragEnabled = true;
        lc.dragControlListeners = {
          accept: function (sourceItemHandleScope, destSortableScope) {
            return lc.dragEnabled;
          },
          orderChanged: function(event){
            console.log("orderChanged", event);
            var sort_order = [], promise;
            lc.dragEnabled = false;

            // update the sort_order attribute on each collection object
            lc.CourseCache.collections.forEach(function(item, index, arr) {
              item.sort_order = index + 1; // order is 1-based, not 0-based
              sort_order.push(item.id);
            });

            // persist the change (send to the server)
            promise = lc.CourseCache.updateCollectionOrder({"id": AppConfig.course_id, "sort_order": sort_order});
            promise.then(function() {
              lc.dragEnabled = true;
              lc.notifications.success("Successfully updated collection list.");
            }).catch(function(r) {
              lc.notifications.error("Failed to update collection list ("+r.status+")");
              console.log(r);
            });
          }
        };
    }
]);
