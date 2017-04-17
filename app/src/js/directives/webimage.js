angular.module('media_manager')
.directive('webimage', function () {

  var isTiff = function(url) {
    return /\.tiff?\s*$/.test(url);
  };

  var setup = function(params) {
    var img = params.img, msg = params.msg;

    var onload = function(e) {
      msg.hide();
      img.show();
    };

    var onerror = function(e) {
      var errmsg = "", errcls = "";

      if(isTiff(img[0].src)) {
        errmsg = "Preview not available. Your browser does not support TIFF previews."
        errcls = "alert alert-warning";
      } else {
        errmsg = "Preview not available. An error occurred while loading the image. Please ensure that the URL is valid and that it is a supported image type.";
        errcls = "alert alert-danger";
      }

      msg[0].className = errcls;
      msg.html(errmsg).show()
      img.hide();
    };

    img.bind("load", onload);
    img.bind("error", onerror);

    var onDestroy = function() {
      img.unbind("load", onload);
      img.unbind("error", onerror);
    };

    return onDestroy;
  };

  return {
    restrict: 'E',
    replace: 'true',
    scope: {img: "="},
    template: [
      '<div class="webimage">',
        '<img ng-src="{{img.url}}" class="preview" alt="Image Preview"/>',
        '<div class="alert"></div>',
      '</div>'
    ].join(''),
    link: function ($scope, elem, attrs) {
      var onDestroy = setup({
        img: elem.find("img"),
        msg: elem.find("div")
      });
      $scope.$on('$destroy', onDestroy);
    }
  };
});
