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

  describe('topic', function(){
    beforeEach(function(){
      notifications.clear();
    });
    describe('set message topic', function(){
      it('should assign the specified topic', function(){
        var topic = "my_topic";
        notifications.success("my message", topic);
        expect(notifications.getLast().topic).toBe(topic)
      });
      it('should assign to the default topic if not specified', function(){
        notifications.success("my message");
        expect(notifications.getLast().topic).toBe(notifications.DEFAULT_TOPIC)
      });
    });
  });

  describe('clear', function(){
    it('should clear the messages array', function(){
      notifications.clear();
      expect(notifications.messages.length).toBe(0);
      notifications.success("foo");
      notifications.error("bar");
      expect(notifications.messages.length).toBe(2)
      notifications.clear();
      expect(notifications.messages.length).toBe(0);
    });
  });

});
