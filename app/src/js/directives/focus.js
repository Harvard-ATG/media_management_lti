angular.module('media_manager')
.directive('focus', ['$parse', '$timeout', function($parse, $timeout){
  return {
    link: function(scope, element, attrs){
      var model = $parse(attrs.focus);
      scope.$watch(model, function(value){
        if(value){
          $timeout(function(){
            element[0].focus();
          }, 100);
        }
      });
    }
  };
}]);
