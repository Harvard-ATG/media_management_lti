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

    var miradorUrl = "/mirador/:collection_id";
    miradorUrl = miradorUrl.replace(':collection_id', $routeParams.collectionId);
    
    mr.canRead = AppConfig.perms.read;
    mr.iframeSrc =  miradorUrl;

    Breadcrumbs.home().addCrumb("Mirador", $location.url());
}]);