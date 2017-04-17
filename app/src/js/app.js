angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource', 'angularSpinner', 'as.sortable', 'ngAnimate'])
.run(function(editableOptions){
  editableOptions.theme = 'bs3';
})
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
    templateUrl: "/static/app/templates/collections.html",
    controller: 'CollectionsController',
    controllerAs: 'lc'
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/mirador.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  })
  .when('/error/:errorCode', {
    templateUrl: "/static/app/templates/error.html",
    controller: 'ErrorController',
    controllerAs: 'er'
  })
}])
.filter("asDate", function () {
    return function (input) {
        return new Date(input);
    }
})
.run(function($http) {
  $http.defaults.headers.common.Authorization = 'Token ' + window.appConfig.access_token;
})
.filter('ellipsit', [function(){
  return function(input, length){
    input = input || '';
    length = parseInt(length) || 20;
    var out = input.substr(0, length);
    if(out.length < input.length){
      out += "...";
    }
    return out;
  };
}])
.filter('newlines', [function(){
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  };
}])
.filter('rawhtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])
.filter('nohtml', function () {
    return function(text) {
        return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
    }
});
;
