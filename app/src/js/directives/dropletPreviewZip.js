angular.module('media_manager')
.directive('dropletPreviewZip', [function(){
  
  // This image data was created from scratch. Steps to re-create:
  //   1. create a 96x96 image in your favorite image editor
  //   2. convert the image to base64 (see https://www.base64-image.de/)
  //   3. create a valid data URI (see https://en.wikipedia.org/wiki/Data_URI_scheme)
  var zipImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAADaUlEQVR42u2br48aQRiGVyAQJxAIRMWJE0gEAkmKOHECcWkQCARNKtHNCcQJBAJxruaSGv6AihOXhiYnLylpmv5IEKRBIHrpNeES2tJmOx8XyLJlj51ll212nzd5E8jszma/Z2e+mcmMYRjGJ2UTh2KJ/fwHCkcmAAAAAAAAAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAAAAAgAA0H8CoKD8Uvmz8tSI9yZbef+x8ivlx0EDSCq/IOiO/q38XvlRUABeK88I9EZ/cwFBG8ATgu/aP5TfKif8BPCBwGr5i/IzPwH8IahaHil3/QRAUPV9EyqA/f39rby3t7dSXyqVWpbJb/vzEomE67rT6fSuIIQHYFvVarWV+prN5rJMfq8DrqPZbGb2+33z9PTUzGQyANg1AKsmk4lZLpejBeD8/FzL8jVadXR05BmABHTT866uruatwNoicrlcdADoOJvNzoO2kATIfo0OgOFw6Oq5EvDxeLy87/LyMn4ApP8djUbLIFxfX5vJZHInAMSlUmml5Uk9sQEgIxfpChaSr9EpIQYFQCzXL3R8fBwfAGdnZyt9cKFQcLw2SAC9Xs8x+UcWgLyoVfV6/cHrgwRgHQDEogXk83lzOp0uX1pawqZ7ggJwcHCw8iHI/0gDsCddaf6SC8IAIDNqaw6SAUCkR0ESaGt/KyDczkJ1AEgyLxaLjq5UKma73V4ZgoqkLNIArElXxv06E58gZ8KiRqMRrZnwpqRbrVa17g8KgHRBh4eH0VsLeijptlot7Tp0ANze3s6vcbJ8DBL0HayKhg/AnnQvLi5cJd1dDkMjC8CedAeDwdq1fAAEBMCedGXRzWtdANgy6dqXlwEQIAB70j05Odn6ZQDgMemuW9sHQIAA7F2PwJCA6Lrb7QLADwBeJaMnAHgAIBMcCd627nQ6/4BdlK1bs5eub1Fubz2xHYbG3Hd+ArgjoNpb1ft+AugTVO29oW0/AVSVfxJY1/5uPHxGwNMBjTfsknZ9PqDsIqdqA0grv1P+RZDXWuLyVbnoclDj6ZCenPp4atwf0KM13FtODn1Ufm7cn6MzggSA/BEAAAAAAAAAAAgAAEAAAAACAAAQAACAAAAABAAAIAAAAAEAAAgAAEAAAAACAACQ3wDGBhtrw/L4L9MAX9xP8r3XAAAAAElFTkSuQmCC';
  
  // This comes from ngDroplet.js, since the browser needs a valid value for the src attribute.
  var blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  return {
    scope: {
      model: '=ngModel'
    },
    restrict: 'EA',
    replace: true,
    template: '<img src="' + blankImage + '" style="background-image: url({{imageData}})" class="droplet-preview" />',
    link: function link(scope) {
        scope.imageData = zipImage;
    }
  };
}]);
