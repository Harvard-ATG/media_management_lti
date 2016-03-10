angular.module('media_manager').controller('ErrorController', ['$scope', '$routeParams', function($scope, $routeParams) {
    var errorCodes = {
        1: "Your session has expired. Please re-launch the tool." // access token expired
    };
    var code = $routeParams.errorCode;
    var msg = (code in errorCodes) ? errorCodes[code] : null;

    $scope.errorCode = code;
    $scope.errorMsg = msg;
}]);
