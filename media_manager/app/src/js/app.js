angular.module('media_manager', ['ngRoute', 'ngDroplet'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: "templates/main.html"
  })
  .when('/workspace', {
    templateUrl: "templates/workspace.html"
  })
  .when('/collections', {
    templateUrl: "templates/collections.html",
    controller: 'ListController',
    controllerAs: 'lc'
  });
}]);
