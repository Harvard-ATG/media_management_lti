angular.module('media_manager').component('appConfirmDelete', {
  templateUrl: '/static/app/templates/components/confirmDelete.html',
  bindings: {
    onConfirm: '&',
    onCancel: '&',
    msg: '@',
    buttonTextOk: '@',
    buttonTextCancel: '@',
  },
  controller: ['$log', function($log) {
    var ctrl = this;
    ctrl.cancel = function() {
      $log.log("cancel");
      ctrl.onCancel({'$event': 'cancel'});
    };
    ctrl.confirm = function() {
      $log.log("confirm");
      ctrl.onConfirm({'$event': 'confirm'});
    };
    ctrl.$onInit = function() {
      if(!ctrl.buttonTextOk) {
        ctrl.buttonTextOk = "OK";
      }
      if(!ctrl.buttonTextCancel) {
        ctrl.buttonTextCancel = "Cancel";
      }
      $log.log("init confirm");
    };
  }]
});
