angular.module('media_manager').service('Breadcrumbs', function() {
    var default_crumbs = [{"text": "Course Collections", "route": "/collections"}];

    this.crumbs = [];

    this.addCrumb = function(text, route) {
        this.crumbs.push({"text": text, "route": route});
        return this;
    };
    this.popCrumb = function() {
        this.crumbs.pop();
        return this;
    };
    this.home = function() {
        this.crumbs = angular.copy(default_crumbs);
        return this;
    };

    this.home();
});
