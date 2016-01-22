angular.module('media_manager').controller('ListController', ['$scope',
    'Collection',
    'Course',
    'CourseCache',
    'AppConfig',
    'Breadcrumbs',
    '$uibModal',
    function(
    $scope,
    Collection,
    Course,
    CourseCache,
    AppConfig,
    Breadcrumbs,
    $uibModal) {
        var lc = this;

        Breadcrumbs.home();
        CourseCache.load();

        lc.collections = CourseCache.collections;

        lc.canEdit = AppConfig.perms.edit;

        lc.deleteCollectionModal = function(id) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: '/build/templates/confirmDelete.html',
                controller: ['$scope', function($scope) {
                    var cd = this;
                    cd.ok = function() {
                        lc.actuallyDeleteCollection(id);
                        modalInstance.close();
                    };
                    cd.cancel = function() {
                        modalInstance.close();
                    };
                }],
                controllerAs: 'cd',
                size: 'sm'
            });
        };

        lc.actuallyDeleteCollection = function(id) {
            var collection = new Collection({
                id: id
            });
            collection.$delete(function() {
                lc.collections.forEach(function(col, index) {
                    if (col.id == id) {
                        lc.collections.splice(index, 1);
                    }
                });
            });

        };


    }
]);