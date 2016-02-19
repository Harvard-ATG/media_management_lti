angular.module('media_manager').service('Notifications', function() {
    var notify = {
        TYPE: {
          INFO:"info",
          WARNING:"warning",
          SUCCESS:"success",
          ERROR:"danger"
        },
        messages: [],
        notify: function(type, msg) {
          if (this.canReset) {
            this.clear();
            this.canReset = false;
          }
          if (!this.isRepeated(msg)) {
            this.messages.push({"type": type, "content": msg});
          }
          return this;
        },
        info: function(msg) {
          return this.notify(this.TYPE.INFO, msg);
        },
        warn: function(msg) {
          return this.notify(this.TYPE.WARNING, msg);
        },
        success: function(msg) {
          return this.notify(this.TYPE.SUCCESS, msg);
        },
        error: function(msg) {
          return this.notify(this.TYPE.ERROR, msg);
        },
        getLast: function() {
          if (this.messages.length == 0) {
            return null;
          }
          return this.messages[this.messages.length - 1];
        },
        isRepeated: function(msg) {
          if (this.getLast()) {
            return msg == this.getLast().content;
          }
          return false;
        },
        clear: function() {
          this.messages = [];
          return this;
        },
        clearOnNext: function() {
          this.canReset = true;
          return this;
        }
    };
    return notify;
});
