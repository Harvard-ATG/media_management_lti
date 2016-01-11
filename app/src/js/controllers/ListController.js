angular.module('media_manager').controller('ListController', ['$scope', function($scope){
  /**
  * @property interface
  * @type {Object}
  */
 $scope.interface = {};

 /**
  * @property uploadCount
  * @type {Number}
  */
 $scope.uploadCount = 0;

 /**
  * @property success
  * @type {Boolean}
  */
 $scope.success = false;

 /**
  * @property error
  * @type {Boolean}
  */
 $scope.error = false;

 // Listen for when the interface has been configured.
 $scope.$on('$dropletReady', function whenDropletReady() {

     $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
     $scope.interface.setRequestUrl('upload.html');
     $scope.interface.defineHTTPSuccess([/2.{2}/]);
     $scope.interface.useArray(false);

 });

 // Listen for when the files have been successfully uploaded.
 $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

     $scope.uploadCount = files.length;
     $scope.success     = true;
     console.log(response, files);

     $timeout(function timeout() {
         $scope.success = false;
     }, 5000);

 });

 // Listen for when the files have failed to upload.
 $scope.$on('$dropletError', function onDropletError(event, response) {

     $scope.error = true;
     console.log(response);

     $timeout(function timeout() {
         $scope.error = false;
     }, 5000);

 });






}]);
