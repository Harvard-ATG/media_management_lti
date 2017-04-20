angular.module('media_manager').service('AppConfig', function() {
    this.config = window.appConfig || {};

    this.perms = this.config.permissions || {};
    this.endpoints = this.config.endpoints || {};
    this.module = this.config.module || {};

    this.course_id = this.config.media_management_api.course_id;
    this.access_token = this.config.media_management_api.access_token;
    this.media_management_api_url = this.config.media_management_api.root_endpoint;

    this.angular_route = this.config.angular_route
    this.resource_link_id = this.config.resource_link_id;

    this.authorization_header = "Token " + this.access_token;
});
