describe("ImageController", function(){
  var imageController;
  var $log;
  var current_image = {"id": 100};
  
  beforeEach(function() {
    module('media_manager');

    module(function($provide){
      $provide.service('CourseCache', function() {
        this.images = [current_image];
        this.getImageById = function() {
          return current_image;
        }
      });
      $provide.service('ImageBehavior', function() {
        this.deleteImageModal = function() {};
        this.actuallyDeleteImage = function() {};
      });
      $provide.service('Image', function() {
        var Image = function() {
        };
        Image.update = function(params, postData, success, error) {
          success(current_image);
          return {};
        };
        return Image;
      });
    });
    inject(function($controller, $rootScope, _$log_) {
        var scope = $rootScope.$new();
        var routeParams = {imageId:current_image.id};
        $log = _$log_;
        imageController = $controller('ImageController', {
          '$scope': scope,
          '$routeParams': routeParams,
          '$log': $log
        });
    });
  });

  describe("test initialization", function(){
    it("controller should be defined", function(){
      expect(imageController).not.toBeUndefined();
    });
  });

  describe("save", function() {
    it("should update the image", function() {
      spyOn(imageController.Image, 'update');
      imageController.save();
      expect(imageController.Image.update).toHaveBeenCalled();
    });
  });

});