angular.module('media_manager').controller('NotificationsController', ['$rootScope', '$scope', 'Notifications', function($rootScope, $scope, Notifications) {
    $scope.notifications = Notifications;
}]);
