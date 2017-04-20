angular.module('media_manager')
.service('CourseModuleService', ['$http', 'AppConfig', function($http, AppConfig){
  var service = this;

  service.collection_id = AppConfig.module.collection_id;

  service.updateModuleCollection = function(collection_id) {
    var url = AppConfig.endpoints.module;
    var data = {"collection_id": collection_id};
    var config = {};
    return $http.post(url, data, config).then(function() {
      service.collection_id = collection_id;
    });
  };
  service.isPrimary = function(collection_id) {
    return service.collection_id == collection_id;
  };
}]);
