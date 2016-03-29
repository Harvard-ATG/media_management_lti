angular.module('media_manager').service('Breadcrumbs', function() {
    var br = this;
    var default_crumbs = [{"text": "List Collections", "route": "/"}];
    this.crumbs = [];
    this.addCrumb = function(text, route) {
        this.crumbs.push({"text": text, "route": route});
    };
    this.popCrumb = function() {
        this.crumbs.pop();
    };
    this.home = function() {
        this.crumbs = angular.copy(default_crumbs);
        return this;
    };
    this.home();
});
