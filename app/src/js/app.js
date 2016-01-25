angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    redirectTo: "/collections"
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
    templateUrl: "build/templates/collectionList.html",
    controller: 'ListController',
    controllerAs: 'lc'
  })
  .when('/mirador/:collectionId', {
    templateUrl: "build/templates/miradorView.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  });
}]);