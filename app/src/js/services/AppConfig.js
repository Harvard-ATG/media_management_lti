angular.module('media_manager').service('AppConfig', function() {
    var config = window.appConfig;

    this.initialConfig = config;
    this.user_id = config.user_id;
    this.perms = config.perms;
    this.context_id = config.context_id;
    this.course_id = config.course_id;
});
