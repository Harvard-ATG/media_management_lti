describe("WorkspaceController", function(){
  var workspaceController;
  var $location;
  var $log;
  var collectionData = {'id':123};

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
        return Collection
      });
    });

    inject(function($controller, $rootScope, _$log_, _$location_) {
      var scope = $rootScope.$new();
      var routeParams = {collectionId:undefined};
      $location = _$location_;
      $log = _$log_;
      workspaceController = $controller('WorkspaceController', {
        '$scope': scope,
        '$routeParams': routeParams,
        '$log': $log,
        '$location': $location
      });
      workspaceController.courseCollections = [];
    });
  });

  describe("test initialization", function(){
    it("controller should be defined", function(){
      expect(workspaceController).not.toBeUndefined();
    });
  });

  describe("saving collection", function() {
    it("should not redirect back to the index", function() {
      spyOn($location, 'path');
      workspaceController.saveCollection();
      expect($location.path).toHaveBeenCalledWith('/workspace/'+collectionData.id);
    });
  });

  describe("inCollection", function(){
    it("should tell me if a courseImage is in the collection", function(){
      var mockCourseImage = { id: 1 };
      var mockCourseImageNotThere = { id: 123 };
      var mockCollectionImages = [
        {id:123, course_image_id:1},
        {id:234, course_image_id:2},
        {id:345, course_image_id:3},
      ];
      workspaceController.collection.images = mockCollectionImages;
      expect(workspaceController.inCollection(mockCourseImage)).toBeTruthy();
      expect(workspaceController.inCollection(mockCourseImageNotThere)).toBeFalsy();
    });
  });

});
