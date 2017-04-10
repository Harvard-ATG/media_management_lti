angular.module('media_manager')
.directive('webimage', function () {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      img: "=",
      onerror: "&",
      imgcls: "@",
      errorcls: "@"
    },
    template: [
      '<div class="webimage">',
        '<img ng-src="{{img.url}}" ng-class="{{imgcls}}"/>',
        '<span class="error">Unable to load image. Please ensure that the URL is valid and that it is a supported image type.</span>',
      '</div>'
    ].join(''),
    link: function ($scope, elem, attrs) {
      //console.log("webimage directive", $scope, elem, attrs);

      var img = elem.find("img");
      var span = elem.find("span");
      var onload = function() {
        span.hide();
        img.show();
      };
      var onerror = function() {
        span.show();
        img.hide();
        if(onerror in attrs) {
          attrs.onerror();
        }
      };

      img.bind("load", onload);
      img.bind("error", onerror);

      $scope.$on('$destroy', function() {
        img.unbind("load", onload);
        img.unbind("error", onerror);
      });

    }
  };
});
