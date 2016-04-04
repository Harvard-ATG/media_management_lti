angular.module('media_manager')
.service('CollectionBehavior', ['$q', '$log', 'Collection', 'CourseCache',  '$uibModal', function($q, $log, Collection, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteCollection = function(id) {
        var collection = new Collection({ id: id });
        return collection.$delete(function() {
            var remove_at_idx = -1;
            var collections = CourseCache.collections;
            for(var idx = 0; idx < collections.length; idx++) {
                if (collections[idx].id == id) {
                    remove_at_idx = idx;
                    break;
                }
            }
            if (remove_at_idx >= 0) {
                $log.debug("removing collection id ", id, " from cache at index", remove_at_idx);
                collections.splice(remove_at_idx, 1);
            }
        });
    };

    service.deleteCollectionModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/modalConfirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                var collection = CourseCache.getCollectionById(id);
                cd.confirm_msg = "Are you sure you want to delete collection " + collection.title + " (ID:" + collection.id + ")? ";
                cd.ok = function() {
                    var deletePromise = service.actuallyDeleteCollection(id);
                    deletePromise.then(function() {
                        deferredDelete.resolve("success");
                    }, function() {
                        deferredDelete.reject("error");
                    });
                    modalInstance.close();
                };
                cd.cancel = function() {
                    modalInstance.close();
                    deferred.reject("cancel")
                };
            }],
            controllerAs: 'cd',
            size: 'sm'
        });
        return deferredDelete.promise;
    };

}]);
