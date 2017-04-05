angular.module('media_manager').service('AppConfig', function() {
    this.config = window.appConfig || {};
    this.perms = this.config.perms;
    this.course_id = this.config.course_id;
    this.resource_link_id = this.config.resource_link_id;
    this.access_token = this.config.access_token;
    this.authorization_header = "Token " + this.config.access_token;
    this.media_management_api_url = this.config.media_management_api_url;
});
