angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource', 'angularSpinner'])
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    redirectTo: "/collections"
  })
  .when('/workspace', {
    templateUrl: "/static/app/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/workspace/:collectionId', {
    templateUrl: "/static/app/templates/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "/static/app/templates/collectionList.html",
    controller: 'ListController',
    controllerAs: 'lc'
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/miradorView.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  });
}])
.filter("asDate", function () {
    return function (input) {
        return new Date(input);
    }
})
.run(function($http) {
  $http.defaults.headers.common.Authorization = 'Token ' + window.appConfig.access_token;
})
