angular.module('media_manager').component('notifications', {
  templateUrl: '/static/app/templates/components/notifications.html',
  bindings: {
    "topic": "<"
  },
  controller: ['Notifications', function(Notifications) {
    var ctrl = this;

    ctrl.getMessages = function() {
      var messages = Notifications.messages.filter(function(message) {
        return message.topic == ctrl.topic;
      });
      return messages;
    };

    ctrl.close = function(message) {
      Notifications.delete(message);
    };

    ctrl.$onInit = function() {
      if(!ctrl.topic) {
        ctrl.topic = Notifications.DEFAULT_TOPIC;
      }
    };

    ctrl.$onChanges = function(changes) {
      console.log('notifications changes', changes);
    };

  }]
});
