angular.module('media_manager').component('breadcrumbs', {
  templateUrl: '/static/app/templates/components/breadcrumbs.html',
  bindings: {},
  controller: ['Breadcrumbs', function(Breadcrumbs) {
    this.crumbs = Breadcrumbs.crumbs;
  }]
});
