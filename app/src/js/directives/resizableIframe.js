angular.module('media_manager')
.directive('resizableIframe', function () {

    var calculateHeight = function(element) {
        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var height = windowHeight - 150; 
        console.log("calculateheight >>", element, windowHeight, "returning", height);
        return height;
    };

    var resize = function(element) {
        var height = calculateHeight(element);
        if (height < 500) {
            height = 500;
        } else if (height > 1000) {
            height = 1000;
        }
        element.css('height', height + "px");
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