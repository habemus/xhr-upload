// native
const EventEmitter = require('events').EventEmitter;

// third-party
const superagent = require('superagent');
const Bluebird   = require('bluebird');

/**
 * Auxiliary function that loops over the properties of an object
 * @param  {Object}   object
 * @param  {Function} fn
 */
function _loopObject(object, fn) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      fn(object[prop], prop);
    }
  }
}

/**
 * Uploads a file to a destination
 * @param  {URL}    destination
 * @param  {File}   file
 * @param  {Object} options
 *        - data
 *        - headers
 * @return {Bluebird}
 */
function xhrUpload(destination, file, options) {

  if (!destination) {
    return Bluebird.reject(new Error('destination is required'));
  }

  if (!file) {
    return Bluebird.reject(new Error('file is required'));
  }

  options = options || {};

  /**
   * An event emitter for upload events.
   * 
   * @type {EventEmitter}
   */
  var uploadEventEmitter = new EventEmitter();

  /**
   * Promise to be resolved or rejected upon the upload finish
   *
   * @type {Bluebird}
   */
  var uploadPromise = new Bluebird(function (resolve, reject) {

    // [1] build form data object
    var formData = new FormData();

    // [1.1] set extra data if needed
    if (options.data) {
      _loopObject(options.data, function (value, key) {
        formData.append(key, value);
      });
    };

    // [1.2] let the file be the last item to be sent
    var fileAs = options.fileAs || 'file';
    formData.append(fileAs, file);

    // [2] build request object
    //     use superagent.getXHR for better cross browser support
    var xhr = superagent.getXHR();

    // [3] add event listeners
    xhr.upload.addEventListener('progress', function handleProgress(e) {
      if (e.lengthComputable) {
        uploadEventEmitter.emit('progress', {
          total: e.total,
          loaded: e.loaded,
          completed: e.loaded / e.total,
        });
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    });
    xhr.upload.addEventListener('error', reject);
    xhr.upload.addEventListener('abort', reject);
    xhr.addEventListener('load', function handleLoad(e) {
      if (xhr.status >= 200 && xhr.status <= 299) {
        // success
        var res = JSON.parse(xhr.responseText);
        resolve(res.data);
      } else {
        reject(xhr);
      }
    });

    // [4] open request
    xhr.open('POST', destination);

    // [5] add headers to request
    if (options.headers) {
      _loopObject(options.headers, function (value, key) {
        xhr.setRequestHeader(key, value);
      });
    }

    // [6] finally send
    xhr.send(formData);

  });
  
  /**
   * Expose the upload promise.
   * @type {Bluebird}
   */
  uploadEventEmitter.promise = uploadPromise;

  return uploadEventEmitter;
}

module.exports = xhrUpload;
