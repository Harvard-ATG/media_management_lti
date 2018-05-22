angular.module('media_manager')
.controller('WorkspaceController', ['$location',
                                    '$routeParams',
                                    'Breadcrumbs',
                                    'Notifications',
                                    'AppConfig',
                                    'CourseCache',
                                    function(
                                      $location,
                                      $routeParams,
                                      Breadcrumbs,
                                      Notifications,
                                      AppConfig,
                                      CourseCache){


  var wc = this;
  wc.canEdit = AppConfig.perms.edit;
  wc.collectionId = $routeParams.collectionId;

  Breadcrumbs.home().addCrumb("Manage Collection", $location.url());
  CourseCache.load();
  Notifications.clear();

}]);
