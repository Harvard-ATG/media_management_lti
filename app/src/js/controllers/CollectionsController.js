angular.module('media_manager').controller('CollectionsController', [
    '$scope',
    'CourseCache',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    'Collection',
    '$q',
    function(
    $scope,
    CourseCache,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs,
    Collection,
    $q) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        var dragEnabled = true;
        lc.dragControlListeners = {
          accept: function (sourceItemHandleScope, destSortableScope) {
            return dragEnabled;
          },
          orderChanged: function(event){
            // disable ordering
            dragEnabled = false;

            var updates = [];
            lc.collections.forEach(function(item, index, arr){
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
