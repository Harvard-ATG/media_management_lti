angular.module('media_manager')
.service('ImageBehavior', ['$q', '$log', 'Image', 'CourseCache', '$uibModal', function($q, $log, Image, CourseCache, $uibModal){
    var service = this;

    service.actuallyDeleteImage = function(id) {
        var image = new Image({ id: id });
        return image.$delete(function() {
            CourseCache.removeImage(id);
        });
    };

    service.deleteImageModal = function(id) {
        var deferredDelete = $q.defer();
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: '/static/app/templates/modalConfirmDelete.html',
            controller: ['$scope', function($scope) {
                var cd = this;
                var image = CourseCache.getImageById(id);
                console.log("id:", id, "image:", image, "images:", CourseCache.images);
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
