describe("WorkspaceController", function(){
  var workspaceController;
  var $location;
  var $log;
  var collectionData = {'id':123};
  var $q;

  var setController = function(collectionId){
    inject(function($controller, $rootScope, _$log_, _$location_, _$q_) {
      var scope = $rootScope.$new();
      var routeParams = {"collectionId":collectionId};
      $q = _$q_;
      $location = _$location_;
      $log = _$log_;
      workspaceController = $controller('WorkspaceController', {
        '$scope': scope,
        '$routeParams': routeParams,
        '$log': $log,
        '$location': $location
      });
      workspaceController.courseCollections = [];
      workspaceController.collection = {
        images: []
      };
    });
  };

  beforeEach(function() {
    module('media_manager');

    module(function($provide){
      var deps = ['Course', 'CollectionBehavior', 'ImageLightBox'];
      deps.forEach(function(dep) {
        $provide.service(dep, function(){});
      });
      $provide.service('AppConfig', function() {
        this.perms = {edit:true};
      });
      $provide.service('Breadcrumbs', function() {
        this.home = function() { return this; };
        this.addCrumb = function() { return this; };
      });
      $provide.service('CourseCache', function() {
        this.load = function() {};
        this.updateSort = function() { return this; };
        this.sortImages = function() {};
      });
      $provide.service('Droplet', function() {
        this.onReady = function() {};
        this.onError = function() {};
        this.onFileAdded = function() {};
        this.onFileDeleted = function() {};
        this.onSuccess = function() {};
      });
      $provide.service('Notifications', function() {
        this.clear = function() {};
        this.success = function() {};
      });
      $provide.service('Preferences', function() {
        this.get = function() {};
      });
      $provide.service('Collection', function() {
        var Collection = function() {
        };
        Collection.save = function(params, postData, success, error) {
          success(collectionData);
          return {};
        };
        Collection.update = function(params, collection, callback){
          callback();
          collection.$promise = $q.defer().promise;
          return collection;
        };
        Collection.get = function(collection){
          collection.$promise = $q.defer().promise;
          collection.images = [];
          return collection;
        };
        return Collection
      });

    });

    setController();
  });

  describe("test initialization", function(){
    it("controller should be defined", function(){
      expect(workspaceController).not.toBeUndefined();
    });
  });

});
