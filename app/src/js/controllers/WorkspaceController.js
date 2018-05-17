angular.module('media_manager')
.controller('WorkspaceController', ['$location',
                                    '$log',
                                    '$routeParams',
                                    'Breadcrumbs',
                                    'Notifications',
                                    'Preferences',
                                    'AppConfig',
                                    'CourseCache',
                                    'Collection',
                                    function(
                                      $location,
                                      $log,
                                      $routeParams,
                                      Breadcrumbs,
                                      Notifications,
                                      Preferences,
                                      AppConfig,
                                      CourseCache,
                                      Collection){


  var wc = this;
  wc.canEdit = AppConfig.perms.edit;
  wc.collectionId = $routeParams.collectionId;

  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());
  CourseCache.load();
  Notifications.clear();

}]);
