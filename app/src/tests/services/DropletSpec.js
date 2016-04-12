describe('Droplet Service', function(){
  var droplet;

  var interfaceMock = function(){
    this.somethingelse = "asdf";
    this.files = [];
    this.FILE_TYPES = {
      'VALID': true
    };
    this.getFiles = function(){
      return files;
    };
    return this;
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

  describe('adding limits', function(){
    var event = null;
    var model = {
      type: true,
      deleteFile: function(){}
    };

    it('should not allow a file to be added if it goes over the maximumValidSize', function(){
      droplet.interface = interfaceMock();
      spyOn(fakeCallbacks, 'success');
      spyOn(fakeCallbacks, 'error');

      droplet.interface.files = [{file: {size: droplet.maximumValidSize - 1}}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model);
      expect(fakeCallbacks.success).toHaveBeenCalled();

      droplet.interface.files = [{file: {size: droplet.maximumValidSize + 1}}];
      droplet.onFileAdded(fakeCallbacks.success, fakeCallbacks.error)(event, model);
      expect(fakeCallbacks.error).toHaveBeenCalled();

    });

  });
});
