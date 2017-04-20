angular.module('media_manager').controller('MiradorController', [
    '$scope',
    '$routeParams',
    '$location',
    'AppConfig',
    'Breadcrumbs',
function(
    $scope,
    $routeParams,
    $location,
    AppConfig,
    Breadcrumbs
) {
    var mr = this;

    var miradorUrl = "/mirador/:collection_id?resource_link_id="+AppConfig.resource_link_id;
    miradorUrl = miradorUrl.replace(':collection_id', $routeParams.collectionId);

    mr.canRead = AppConfig.perms.read;
    mr.canEdit = AppConfig.perms.edit;
    mr.showBreadcrumbs = !AppConfig.module.enabled;
    mr.iframeSrc =  miradorUrl;
    mr.collection_id = $routeParams.collectionId;

    Breadcrumbs.home().addCrumb("Mirador", $location.url());
}]);
