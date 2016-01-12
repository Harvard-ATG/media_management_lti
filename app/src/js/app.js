angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'filereader', 'ngResource'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: "build/templates/main.html"
  })
  .when('/workspace', {
    templateUrl: "build/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/workspace/:collectionId', {
    templateUrl: "build/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "build/templates/collections.html",
    controller: 'ListController',
    controllerAs: 'lc'
  });
}]);
