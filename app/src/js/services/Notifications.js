angular.module('media_manager').factory('Notifications', function() {
    var IDGEN = 0;
    var service = {
        TYPE: {
          INFO:"info",
          WARNING:"warning",
          SUCCESS:"success",
          ERROR:"danger"
        },
        DEFAULT_TOPIC: 'default',
        messages: [],
        nextid: function() {
          IDGEN++;
          return IDGEN;
        },
        notify: function(type, msg, topic) {
          topic = topic || this.DEFAULT_TOPIC;
          if(this.isRepeated(msg, topic)) {
            return this;
          }
          this.messages.push({
            "id": this.nextid(),
            "type": type,
            "content": msg,
            "topic": topic,
            "timestamp": Date.now()
          });
          console.log("notify", this.messages, this);
          return this;
        },
        info: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.INFO);
          return this.notify.apply(this, args);
        },
        warn: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.WARNING);
          return this.notify.apply(this, args);
        },
        success: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.SUCCESS);
          return this.notify.apply(this, args);
        },
        error: function(msg) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(this.TYPE.ERROR);
          return this.notify.apply(this, args);
        },
        getLast: function() {
          if (this.messages.length == 0) {
            return null;
          }
          return this.messages[this.messages.length - 1];
        },
        filterMessagesByTopic: function(messages, topic) {
          topic = topic || this.DEFAULT_TOPIC;
          if(topic == "*") {
            return messages;
          }
          return messages.filter(function(msg) {
            return msg.topic == topic;
          });
        },
        isRepeated: function(msg, topic) {
          if (this.getLast()) {
            return msg == this.getLast().content && topic == this.getLast().topic;
          }
          return false;
        },
        clear: function() {
          while(this.messages.length > 0) {
            this.messages.shift();
          }
          return this;
        },
        delete: function(message) {
          var found = -1;
          for(var i = 0; i < this.messages.length; i++) {
            if(this.messages[i].id == message.id) {
              found = i;
              break;
            }
          }
          if(found >= 0) {
            this.messages.splice(found, 1);
          }
          return this;
        }
    };
    return service;
});
