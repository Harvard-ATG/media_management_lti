angular.module('media_manager').controller('ListController', ['$scope',
                                                              'Collection',
                                                              'Course',
                                                              function($scope,
                                                              Collection,
                                                              Course){
  var lc = this;
  lc.collections = Course.getCollections({id: 2});





}]);
