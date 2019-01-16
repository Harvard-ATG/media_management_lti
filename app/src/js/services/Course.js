angular.module('media_manager').factory('Course', ['$resource', 'AppConfig', function($resource, AppConfig){
  var host = AppConfig.media_management_api_url;
  var headers = {
    'Authorization': AppConfig.authorization_header
  };
  var paramDefaults = {
    id: '@id',
    image_id: '@image_id',
    collection_id: '@collection_id'
  };

  return $resource(host + '/courses/:id', paramDefaults, {
      'getCourse': {
        method: 'GET',
        headers: headers,
        url: host + '/courses/:id'
      },
      'getCourses': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses',
      },
      'getImages': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/images'
      },
      'getCourseCopies': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/course_copy',
      },
      'getCollections': {
        method: 'GET',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/collections'
      },
      'updateCollectionOrder': {
        method: 'PUT',
        headers: headers,
        url: host + '/courses/:id/collections',
        transformRequest: function(data) {
          return JSON.stringify({"sort_order": data['sort_order']});
        }
      },
      'deleteCollections': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/collections'
      },
      'deleteImages': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/images'
      },
      'deleteCourseCopies': {
        method: 'DELETE',
        headers: headers,
        url: host + '/courses/:id/course_copy'
      },
      'copyCourse': {
        method: 'POST',
        headers: headers,
        url: host + '/courses/:id/course_copy',
        transformRequest: function(data) {
          console.log("transform copyCourse", data);
          return JSON.stringify({"copy_source_id": data['copy_source_id']});
        }
      },
      'addWebImage': {
        method: 'POST',
        headers: headers,
        isArray: true,
        url: host + '/courses/:id/images',
        transformRequest: function(data) {
          var url = data["url"];
          var title = data["title"];
          var transformed = {
            "items": [{ "url": url, "title": title }]
          };
          return JSON.stringify(transformed);
        }
      }
    }
  );
}]);
