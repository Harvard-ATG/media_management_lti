angular.module('media_manager').controller('ListController', ['$scope',
                                                              'Collection',
                                                              'Course',
                                                              '$uibModal',
                                                              function($scope,
                                                              Collection,
                                                              Course,
                                                              $uibModal){
  var lc = this;
  lc.collections = Course.getCollections({id: 1});


  lc.deleteCollectionModal = function(id){
    console.log("ASDFASDFASDFASD");
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: '/build/templates/confirmDelete.html',
      controller: ['$scope', function($scope){
        var cd = this;
        cd.ok = function(){
          lc.actuallyDeleteCollection(id);
          modalInstance.close();
        };
        cd.cancel = function(){
          modalInstance.close();
        };
      }],
      controllerAs: 'cd',
      size: 'sm'
    });
  };

  lc.actuallyDeleteCollection = function(id){
    var collection = new Collection({id: id});
    collection.$delete(function(){
      lc.collections.forEach(function(col, index){
        if(col.id == id){
          lc.collections.splice(index, 1);
        }
      });
    });

  };


}]);
