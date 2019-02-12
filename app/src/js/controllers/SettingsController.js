angular.module('media_manager').controller('SettingsController', [
  '$scope',
  '$routeParams',
  '$location',
  'AppConfig',
  'Breadcrumbs',
  'Notifications',
  function(
    $scope,
    $routeParams,
    $location,
    AppConfig,
    Breadcrumbs,
    Notifications
  ) {
  var sc = this;
  sc.canEdit = AppConfig.perms.edit;

  Breadcrumbs.home().addCrumb("Settings", $location.url());
  Notifications.clear();

}]);
