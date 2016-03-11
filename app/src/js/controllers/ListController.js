angular.module('media_manager').controller('ListController', [
    '$scope',
    'CourseCache',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    'Collection',
    function(
    $scope,
    CourseCache,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs,
    Collection) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        lc.dragControlListeners = {
          orderChanged: function(event){

            lc.collections.forEach(function(item, index, arr){
              var newsort = index + 1;
              if(item.sort_order !== newsort){
                arr[index].sort_order = newsort;
                Collection.update({id: item.id}, arr[index]);
              }
            });

          }
        };

    }
]);
