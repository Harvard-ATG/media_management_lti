describe('Droplet Service', function(){
  var droplet;

  var interfaceMock = function(){
    this.files = [];
    this.FILE_TYPES = {
      'VALID': 1
    };
    this.getFiles = function(){
      return this.files;
    };
  };

  var fakeCallbacks = {
    success: function(){},
    error: function(){}
  };

  beforeEach(function(){
    module('media_manager');

    inject(function($injector){
      droplet = $injector.get('Droplet');
    });
  });

  describe('upload limits', function(){
    var event = null;

    it('should enforce a size limit for individual images', function(){
      droplet.interface = new interfaceMock();
      spyOn(fakeCallbacks, 'success');
      spyOn(fakeCallbacks, 'error');

      var model_success = {
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.jpg", type: "image/jpeg", size: droplet.limits.imageSize},
        deleteFile: function(){}
      };
      droplet.interface.files = [{file: model_success.file}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model_success);
      expect(fakeCallbacks.success).toHaveBeenCalled();

      var model_error = {
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.jpg", type: "image/jpeg", size: droplet.limits.imageSize + 1},
        deleteFile: function(){}
      };
      droplet.interface.files = [{file: model_error.file}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model_error);
      expect(fakeCallbacks.error).toHaveBeenCalled();
    });

    it('should enforce a size limit for individual ZIP files', function(){
      droplet.interface = new interfaceMock();
      spyOn(fakeCallbacks, 'success');
      spyOn(fakeCallbacks, 'error');

      var model_success = {
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.zip", type: "application/zip", size: droplet.limits.zipSize},
        deleteFile: function(){}
      };
      droplet.interface.files = [{file: model_success.file}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model_success);
      expect(fakeCallbacks.success).toHaveBeenCalled();

      var model_error = {
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.zip", type: "application/zip", size: droplet.limits.zipSize + 1},
        deleteFile: function(){}
      };
      droplet.interface.files = [{file: model_error.file}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model_error);
      expect(fakeCallbacks.error).toHaveBeenCalled();
    });

    it('should enforce a size limit for the upload (aggregate across all files being uploaded)', function(){
      droplet.interface = new interfaceMock();
      spyOn(fakeCallbacks, 'success');
      spyOn(fakeCallbacks, 'error');

      var uploadSize = droplet.limits.uploadSize;
      var imageSize = droplet.limits.imageSize;
      var model = {
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.jpg", type: "image/jpeg", size: imageSize},
        deleteFile: function(){}
      };

      var models = [];
      var num_models = Math.floor(uploadSize / imageSize);
      for(var i = 0; i < num_models; i++) {
        models.push(model);
      }
      droplet.interface.files = models;
    
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, models[models.length-1]);
      expect(fakeCallbacks.success).toHaveBeenCalled();
      
      models.push({
        type: droplet.interface.FILE_TYPES.VALID,
        file: {name: "test.jpg", type: "image/jpeg", size: 1},
        deleteFile: function(){} 
      });

      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, models[models.length-1]);
      expect(fakeCallbacks.error).toHaveBeenCalled();
    });

  });
});
