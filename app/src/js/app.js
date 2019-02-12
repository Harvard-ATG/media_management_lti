angular.module('media_manager', ['ui.bootstrap', 'ngRoute', 'ngDroplet', 'xeditable', 'ngResource', 'angularSpinner', 'as.sortable', 'ngAnimate'])
.run(function(editableOptions){
  editableOptions.theme = 'bs3';
})
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $locationProvider.hashPrefix('!');
  $routeProvider
  .when('/', {
    redirectTo: function() {
      console.log("Index redirecting to: ", window.appConfig.angular_route);
      return window.appConfig.angular_route;
    }
  })
  .when('/workspace', {
    templateUrl: "/static/app/templates/controllers/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/workspace/:collectionId', {
    templateUrl: "/static/app/templates/controllers/workspace.html",
    controller: 'WorkspaceController',
    controllerAs: 'wc'
  })
  .when('/collections', {
    templateUrl: "/static/app/templates/controllers/collections.html",
    controller: 'CollectionsController',
    controllerAs: 'lc'
  })
  .when('/settings', {
    templateUrl: "/static/app/templates/controllers/settings.html",
    controller: "SettingsController",
    controllerAs: 'sc',
  })
  .when('/mirador/:collectionId', {
    templateUrl: "/static/app/templates/controllers/mirador.html",
    controller: 'MiradorController',
    controllerAs: 'mr'
  })
  .when('/image/:imageId', {
    templateUrl: "/static/app/templates/controllers/image.html",
    controller: 'ImageController',
    controllerAs: 'ic'
  })
  .when('/error/:errorCode', {
    templateUrl: "/static/app/templates/controllers/error.html",
    controller: 'ErrorController',
    controllerAs: 'er'
  })
}])
.config(['$logProvider', function($logProvider) {
  var debugEnabled = true;
  console.log("debugEnabled:", debugEnabled);
  $logProvider.debugEnabled(debugEnabled);
}])
.filter("asDate", function () {
    return function (input) {
        return new Date(input);
    }
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
})
;
