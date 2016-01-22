angular.module('media_manager').controller('BreadcrumbsController', ['$rootScope', '$scope', 'Breadcrumbs', function($rootScope, $scope, Breadcrumbs) {
    var br = this;
    $scope.crumbs = Breadcrumbs.crumbs;
}]);