angular.module('media_manager').controller('BreadcrumbsController', ['$rootScope', '$scope', 'Breadcrumbs', function($rootScope, $scope, Breadcrumbs) {
    $scope.crumbs = Breadcrumbs.crumbs;
}]);
