angular.module('media_manager')
.service('Droplet', ['$timeout', function($timeout){
  var ds = this;

  ds.interface = {};
  ds.uploadCount = 0;
  ds.success = false;
  ds.error = false;
  ds.scope = undefined;

  var dummydata = [
    "http://localhost:7000/image1.jpg",
    "http://localhost:7000/image2.jpg"
  ];

  // Listen for when the interface has been configured.
  ds.whenDropletReady = function() {

      ds.scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
      ds.scope.interface.setRequestUrl('http://localhost:7000/upload.html');
      ds.scope.interface.defineHTTPSuccess([/2.{2}/]);
      ds.scope.interface.useArray(false);

      dummydata.forEach(function(url){
        addFile(url, function(blob){
          ds.scope.interface.addFile(blob);
          ds.scope.$digest();
        });
      });

  };

  // Listen for when the files have been successfully uploaded.
  ds.onDropletSuccess = function(event, response, files) {

      ds.scope.uploadCount = files.length;
      ds.scope.success     = true;

      $timeout(function timeout() {
          ds.scope.success = false;
      }, 5000);

  };

  // Listen for when the files have failed to upload.
  ds.onDropletError = function(event, response) {

      ds.scope.error = true;

      $timeout(function timeout() {
          ds.scope.error = false;
      }, 5000);

  };

  var addFile = function(url, callback){
    var blob = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
    xhr.onload = function()
    {
        blob = xhr.response;//xhr.response is now a blob object
        //var file = FileReader.readAsDataURL(blob);
        blob.lastModifiedDate = new Date();
        blob.name = "somename.jpg";
        //blob.imageData = FileReader.readAsBinaryString(blob);
                       //FileReader.readAsBinaryString
        //console.log("data url");
        //console.log(blob.imageData);

        //console.log(typeof file);
        //console.log($scope.interface);
        //$scope.models.push(blob);
        callback(blob);
    }
    xhr.send();

  };


}]);
