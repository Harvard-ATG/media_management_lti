angular.module('media_manager')
.directive('resizableIframe', function () {

    var calculateHeight = function(element) {
        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var offsetTop = element[0].offsetTop || 0;
        var height = windowHeight - offsetTop;
        return height;
    };

    var resize = function(element) {
        var height_px = calculateHeight(element) + "px";
        element.css('height', height_px);
    };

    return {
        // This directive automatically resizes the iframe to fill the screen.
        link: function ($scope, element, attrs) {
            var onResize = function() {
                resize(element);
            };

            $(window).on('resize', onResize);
            
            $scope.$on('$destroy', function() {
                $(window).off('resize', onResize);
            });
            
            resize(element);
        }
    };
});