angular.module('media_manager').controller('ListController', [
    '$scope',
    'CourseCache',
    'CollectionBehavior',
    'AppConfig',
    'Breadcrumbs',
    function(
    $scope,
    CourseCache,
    CollectionBehavior,
    AppConfig,
    Breadcrumbs) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;
        lc.canEdit = AppConfig.perms.edit;
        lc.deleteCollectionModal = CollectionBehavior.deleteCollectionModal;
        lc.actuallyDeleteCollection = CollectionBehavior.actuallyDeleteCollection;
        lc.isLoadingCollections = CourseCache.isLoadingCollections;

        lc.dragControlListeners = {

        };

    }
]);
