// native dependencies
const path = require('path');
const http = require('http');

// third-party
const Bluebird = require('bluebird');

/**
 * Starts a server and keeps reference to it.
 * This reference will be used for teardown.
 */
exports.startServer = function (port, app) {

  if (!port) { throw new Error('port is required'); }
  if (!app) { throw new Error('app is required'); }

  // create http server and pass express app as callback
  var server = this.server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {

      // register the server to be tore down
      exports.registerTeardown(function () {
        return new Promise((resolve, reject) => {
          server.close(resolve);
        })
      });

      // resolve with the server
      resolve(server);
    });
  });
};

/**
 * Sets up an assets object that is ready for the tests
 * @return {[type]} [description]
 */
exports.setup = function () {
  var _assets = {};

  return Bluebird.resolve(_assets);
};

var TEARDOWN_CALLBACKS = [];

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
exports.registerTeardown = function (teardown) {
  TEARDOWN_CALLBACKS.push(teardown);
};

/**
 * Executes all functions listed at TEARDOWN_CALLBACKS
 */
exports.teardown = function () {
  return Promise.all(TEARDOWN_CALLBACKS.map((fn) => {
    return fn();
  }))
  .then(() => {
    TEARDOWN_CALLBACKS = [];
  });
};
