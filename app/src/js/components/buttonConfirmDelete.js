angular.module('media_manager').component('appButtonConfirmDelete', {
  templateUrl: '/static/app/templates/components/buttonConfirmDelete.html',
  bindings: {
    onConfirm: '&',
    onCancel: '&',
    msg: '@',
    buttonText: '@',
    buttonTextOk: '@',
    buttonTextCancel: '@',
  },
  controller: ['$log', function($log) {
    var ctrl = this;
    ctrl.showConfirm = false;
    ctrl.cancel = function() {
      $log.log("cancel");
      ctrl.showConfirm = false;
      ctrl.onCancel({'$event': 'cancel'});
    };
    ctrl.confirm = function() {
      $log.log("confirm");
      ctrl.showConfirm = false;
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
