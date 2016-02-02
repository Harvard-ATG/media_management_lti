angular.module('media_manager')
.service('ImageBehavior', ['$q', '$log', 'Image', 'CourseCache', '$uibModal', function($q, $log, Image, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteImage = function(id) {
        var image = new Image({ id: id });
        return image.$delete(function() {
            var remove_at_idx = -1;
            var images = CourseCache.images;
            for(var idx = 0; idx < images.length; idx++) {
                if (images[idx].id == id) {
                    remove_at_idx = idx;
                    break;
                }
            }
            if (remove_at_idx >= 0) {
                $log.debug("removing image id ", id, " from cache at index", remove_at_idx);
                images.splice(remove_at_idx, 1);
            }
        });
    };

    service.deleteImageModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/confirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                console.log("id: " + id);
                console.log(CourseCache.images);
                var image = CourseCache.getImageById(id);
                console.log(image);
                cd.confirm_msg = "Are you sure you want to delete image " + image.title + " (ID:" + image.id + ")? ";
                cd.ok = function() {
                    var deletePromise = service.actuallyDeleteImage(id);
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
