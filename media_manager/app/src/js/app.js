angular.module('media_manager', ['ngRoute'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: "templates/main.html"
  });
}]);
