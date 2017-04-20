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
            lc.notifications.success("Failure. Primary collection not updated ("+response.status+")");
          });
        };

        var dragEnabled = true;
        lc.dragControlListeners = {
          accept: function (sourceItemHandleScope, destSortableScope) {
            return dragEnabled;
          },
          orderChanged: function(event){
            // disable ordering
            dragEnabled = false;

            var updates = [];
            lc.CourseCache.collections.forEach(function(item, index, arr){
              var d = $q.defer();
              var newsort = index + 1;
              if(item.sort_order != newsort){
                arr[index].sort_order = newsort;
                updates.push(Collection.update({id: item.id}, arr[index]).$promise);

              }
            });
            $q.all(updates).then(function(){
              // enable ordering
              dragEnabled = true;
            });

          }
        };


    }
]);
