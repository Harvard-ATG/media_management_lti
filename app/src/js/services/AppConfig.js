angular.module('media_manager').service('AppConfig', function() {
    this.config = window.appConfig || {};

    // Permissions granted to the currently logged-in user
    this.perms = this.config.permissions || {};

    // Application endpoint URLs for AJAX interactions
    this.endpoints = this.config.endpoints || {};

    // Module-mode configuration
    // This just means the application is configured as a "module" in Canvas
    // and may opt to show a specific collection first, rather than the list of collections
    this.module = this.config.module || {};

    // Related to the module-mode configuration.
    // Defines the initial route when the application first loads.
    this.angular_route = this.config.angular_route

    // Configuration related to the Media Management API
    this.config.media_management_api = this.config.media_management_api || {};
    this.course_id = this.config.media_management_api.course_id;
    this.access_token = this.config.media_management_api.access_token;
    this.media_management_api_url = this.config.media_management_api.root_endpoint;

    // This is an LTI parameter that is used to uniquely identify sessions,
    // since the same tool may be instantiated multiple times in a given course,
    // or across courses. This parameter must be included with every request as a
    // query parameter. Example:
    //
    //    http://localhost:8000/path/to/view?resource_link_id=2a8b2d3fa51ea413d19
    this.resource_link_id = this.config.resource_link_id;

    this.authorization_header = "Token " + this.access_token;
});
