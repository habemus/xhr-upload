// native
const path = require('path');
const http = require('http');

// third-party
const Bluebird = require('bluebird');
const enableDestroy = require('server-destroy');
const fse = require('fs-extra');

// own
const fileServer = require('./file-server');

const FILE_SERVER_PORT = 9000;

const FIXTURES_PATH = path.join(__dirname, '../fixtures');
const TMP_PATH      = path.join(__dirname, '../tmp');

exports.fixturesPath = FIXTURES_PATH;
exports.tmpPath      = TMP_PATH;

exports.errorExpected = function () {
  return Bluebird.reject(new Error('error expected'));
};

exports.setup = function () {

  var _assets = {};

  fse.emptyDirSync(TMP_PATH);

  exports.registerTeardown(function () {
    fse.emptyDirSync(TMP_PATH);
  });

  return new Bluebird((resolve, reject) => {
    // start the file server

    var app = fileServer({
      filesDir: FIXTURES_PATH,
      uploadsDir: TMP_PATH,
    });

    // create http server and pass express app as callback
    var server = http.createServer(app);

    // make the server destroyable
    enableDestroy(server);

    server.listen(FILE_SERVER_PORT, () => {
      console.log('file server listening at port ' + FILE_SERVER_PORT);
      resolve();
    });

    // register the server to be tore down
    exports.registerTeardown(function () {
      return new Bluebird(function (resolve, reject) {
        server.destroy((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  })
  .then(() => {
    return _assets
  });

};

var TEARDOWN_CALLBACKS = [];

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
exports.registerTeardown = function (teardown) {
  TEARDOWN_CALLBACKS.push(teardown);
};

exports.teardown = function () {
  return Bluebird.all(TEARDOWN_CALLBACKS.map((fn) => {
    return fn();
  }))
  .then(() => {
    TEARDOWN_CALLBACKS = [];
  });
};
