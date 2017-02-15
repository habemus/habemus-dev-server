// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// own
const aux = require('./auxiliary');

// constants
const JS_MIME_TYPE = require('mime').lookup('.js');

module.exports = function (app, options) {
  // ensure some browserify specific options
  if (!options.browserifyBundleRegistryURI) {
    throw new Error('browserifyBundleRegistryURI is required');
  }

  const errors = app.errors;
  
  /**
   * Name of the support directory
   */
  const supportDir = options.supportDir;

  var browserifyProcessor = {};

  /**
   * Processes the input file.
   * @param  {Vinyl} file
   * @param  {Express Req} req
   * @return {Bluebird -> Vinyl}
   */
  browserifyProcessor.exec = function (file, projectConfig, req) {

    // skip browserifying if project configurations
    // do not have browserify enabled
    if (!aux.hasBrowserifyEnabled(projectConfig)) {
      return file;
    }

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;
    
    var browserifyProc = aux.invokeBrowserifyEntriesScript({
      fsRoot: file.base,
      supportDir: supportDir,
      entries: [
        requestPath
      ],
    });

    file.contents = browserifyProc.stdout;

    // TODO: Enable stdout streaming, for improved performance.
    // Current problems: the child_process may emit errors
    // which should not go unoticed.
    
    return new Bluebird((resolve, reject) => {
      var bufs = [];
      browserifyProc.stdout.on('data', (d) => {
        bufs.push(new Buffer(d));
      });
  
      browserifyProc.on('exit', function (code) {
        if (code !== 0) {
          console.warn('exited with code ' + code);
          reject(new Error('exited with code ' + code));
        } else {
          file.contents = Buffer.concat(bufs);
          resolve(file);
        }
      });

    });
  };

  /**
   * Browserify requires some htmlInjectors to work
   * @type {Array}
   */
  browserifyProcessor.htmlInjectors = [
    require('./inject-browserify-bundle-script')(app, options),
  ];

  return browserifyProcessor;
};
