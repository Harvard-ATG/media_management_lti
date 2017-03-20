angular.module('media_manager').component('notifications', {
  templateUrl: '/static/app/templates/notifications.html',
  bindings: {
    "topic": "<"
  },
  controller: ['Notifications', function(Notifications) {
    var ctrl = this;
    if(!ctrl.topic) {
      ctrl.topic = Notifications.DEFAULT_TOPIC;
    }
    ctrl.messages = Notifications.messages;
    ctrl.close = function(message) {
      Notifications.delete(message);
    };
  }]
});
