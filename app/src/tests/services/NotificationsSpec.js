describe('Notifications service', function(){
  var notifications;

  beforeEach(function(){

    module('media_manager');

    inject(function($injector){
      notifications = $injector.get('Notifications');
    });
  });

  describe('notify', function(){
    var someMsg = "bam1";
    var someOtherMsg = "bam2";

    it('should add to the messages queue', function(){
      expect(notifications.messages.length).toBe(0);
      notifications.notify(notifications.TYPE.INFO, someMsg);
      expect(notifications.messages.length).toBe(1);
      notifications.notify(notifications.TYPE.INFO, someOtherMsg);
      expect(notifications.messages.length).toBe(2);
    });
    it('should not add the same message twice', function(){
      expect(notifications.messages.length).toBe(0);
      notifications.notify(notifications.TYPE.INFO, someMsg);
      expect(notifications.messages.length).toBe(1);
      notifications.notify(notifications.TYPE.INFO, someMsg);
      expect(notifications.messages.length).toBe(1);
    });

    describe('error', function(){
      it('should call the notify method with an error', function(){
        spyOn(notifications, 'notify');
        notifications.error(someMsg);
        expect(notifications.notify).toHaveBeenCalledWith(notifications.TYPE.ERROR, someMsg);
      });
    });
  });

  describe('location', function(){
    var loc = "some location";
    beforeEach(function(){
      notifications.location = undefined;
    });
    describe('getLocation', function(){
      it('should get the current notification', function(){
        notifications.location = loc;
        expect(notifications.getLocation()).toBe(loc);
      });
      it('should return "top" if there is no location', function(){
        expect(notifications.getLocation()).toBe("top");
      });
    });
    describe('setLocation', function(){
      it('should set the location and return itself', function(){
        var otherLoc = "asdfasdf";
        notifications.setLocation(otherLoc);
        expect(notifications.location).toBe(otherLoc);
      });
    });
  });

  describe('clear', function(){
    it('should clear the messages array', function(){
      var msg = "sadf";
      var type = notifications.TYPE.INFO;
      notifications.messages.push({"type": type, "content": msg});
      notifications.clear();
      expect(notifications.messages.length).toBe(0);
    });
  });

});
