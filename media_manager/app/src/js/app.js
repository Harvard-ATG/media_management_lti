angular.module('media_manager', ['ngRoute', 'ngDroplet', 'filereader', 'ngResource'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: "templates/main.html"
  })
  .when('/workspace', {
    templateUrl: "templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "templates/collections.html",
    controller: 'ListController',
    controllerAs: 'lc'
  });
}]);
