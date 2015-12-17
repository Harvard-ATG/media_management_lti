angular.module('media_manager')
.factory('Courses', ['$resource', function($resource){
  return $resource('http://localhost:8000/courses/:id');
}]);

angular.module('media_manager')
.factory('CourseImages', ['$resource', function($resource){
  return $resource('http://localhost:8000/courses/:id/images',
    { id: '@id' },
    { 'get':    { method:'GET', isArray: true } }
  );
}]);
