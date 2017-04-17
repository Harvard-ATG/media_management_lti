angular.module('media_manager')
.service('Droplet', ['$timeout', '$log', '$q', 'AppConfig', function($timeout, $log, $q, AppConfig){
  var ds = this;
  var ONE_MEGABYTE = 1000000; // bytes

  ds.interface = null;

  ds.requestHeaders = {
    'Accept': 'application/json',
    'Authorization': AppConfig.authorization_header
  };

  ds.allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'zip', 'tif', 'tiff'];

  ds.limits = {
    uploadSize:  200 * ONE_MEGABYTE,
    zipSize:     200 * ONE_MEGABYTE,
    imageSize:    20 * ONE_MEGABYTE
  };

  ds.validators = [
    {
      "name": "valid_file_type",
      "fn": function(model, errors) {
          var msg;
          var is_valid = (model.type == ds.interface.FILE_TYPES.VALID);
          if (is_valid) {
            return true;
          } else {
            msg = "Invalid image: '" + model.file.name +"'. Cannot upload file with extension '" + model.extension + "'. File extension must be one of: " + ds.allowedExtensions.join(", ");
            errors.push(msg);
            $log.debug("validator:", this.name, "msg:", msg);
            return false;
          }
      }
    },
    {
      "name": "valid_file_size",
      "fn": function(model, errors) {
        var msg, max_size;
        var is_valid = ds.isValidFileSize(model.file);
        if (is_valid) {
          return true;
        } else {
          max_size = ds.isZipFile(model.file) ? ds.limits.zipSize : ds.limits.imageSize;
          msg = "File '" + model.file.name + "' (" + model.file.type + ") is too large. Limit " + ds.getSizeInMegabytes(max_size) + "MB.";
          errors.push(msg);
          $log.debug("validator:", this.name, "msg:", msg);
          return false;
        }
      }
    },
    {
      "name": "valid_upload_size",
      "fn": function(model, errors) {
        var msg;
        var is_valid = ds.isValidUploadSize();
        if (is_valid) {
          return true;
        } else {
          msg = "Total upload size is too large. Imported images cannot exceed " + ds.getSizeInMegabytes(ds.limits.uploadSize, 0) + "MB per upload.";
          errors.push(msg);
          $log.debug("validator:", this.name, "msg:", msg);
          return false;
        }
      }
    },
  ];

  // Returns the image upload URL.
  ds.getUploadUrl = function() {
      var request_url = ":base_url/courses/:course_id/images";
      request_url = request_url.replace(':base_url', AppConfig.media_management_api_url);
      request_url = request_url.replace(':course_id', AppConfig.course_id);
      return request_url;
  };

  ds.onReady = function() {
    ds.interface.allowedExtensions(ds.allowedExtensions);
    ds.interface.setRequestUrl(ds.getUploadUrl());
    ds.interface.setRequestHeaders(ds.requestHeaders);
    ds.interface.defineHTTPSuccess([/2.{2}/]);
    ds.interface.useArray(false);
    ds.interface.setPostData({"title": "Untitled"})
    $log.debug("Ready: droplet ready", ds.interface);
  };

  ds.onSuccess = function(callback) {
    return function(event, response, files) {
      $log.debug("Success: droplet uploaded file: ", files, response);
      if (callback) {
        callback(event, response, files);
      }
    };
  };

  ds.onError = function(callback) {
    return function(event, response) {
      $log.debug("Error: droplet uploaded file: ", response);
      if(callback) {
        callback(event, response);
      }
    };
  };

  ds.onFileAdded = function(success, error) {
    return function(event, model) {
      $log.debug("Notification: droplet file added", model);
      var errors = [], valid = true, validator;

      // run validator tests against the model and the droplet queue
      for(var i = 0; i < ds.validators.length; i++) {
        validator = ds.validators[i];
        valid = validator.fn.call(validator, model, errors);
        if (!valid) {
          break;
        }
      }

      // check the validation result and invoke the appropriate callback
      if (valid) {
        success(event, model);
      } else {
        model.deleteFile(); // remove the model from the droplet queue because it isn't valid
        error(event, model, errors.join('\n'));
      }
    };
  };

  ds.onFileDeleted = function(callback) {
    return function(event, model) {
      $log.debug("Notification: droplet file deleted", model);
      if(callback) {
        callback(event, model);
      }
    };
  };

  ds.getTotalValid = function() {
    return ds.interface ? ds.getValidFiles().length : 0;
  };

  ds.getValidFiles = function() {
    return ds.interface.getFiles(ds.interface.FILE_TYPES.VALID) || [];
  };

  ds.uploadFiles = function() {
    if (ds.interface) {
      $log.debug("Notification: uploadFiles()")
      ds.interface.uploadFiles();
    } else {
      $log.error("Error: droplet interface not available to upload files");
    }
  };

  ds.getUploadSize = function() {
    var files = ds.getValidFiles() || [];
    return files.reduce(function(totalSize, item){
      return totalSize + item.file.size;
    }, 0);
  };

  ds.getUploadSizeMB = function() {
    return ds.getSizeInMegabytes(ds.getUploadSize());
  };

  ds.isValidUploadSize = function() {
    return ds.getUploadSize() <= ds.limits.uploadSize;
  };

  ds.isValidFileSize = function(file) {
    var limit = ds.limits.imageSize;
    if (ds.isZipFile(file)) {
      limit = ds.limits.zipSize;
    }
    return file.size <= limit;
  };

  ds.isZipFile = function(file) {
    return file.type.indexOf("zip") !== -1;
  };

  ds.getSizeInMegabytes = function(size, fixed) {
    fixed = fixed || 2;
    return (size / ONE_MEGABYTE).toFixed(2);
  };

}]);
