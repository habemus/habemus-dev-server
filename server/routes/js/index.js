// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// own
const aux = require('./auxiliary');

// constants
const JS_MIME_TYPE = require('mime').lookup('.js');

module.exports = function (app, options) {

  const errors = app.errors;
  
  /**
   * Name of the support directory
   */
  const supportDir = options.supportDir;

  app.get('**/*.js', function (req, res, next) {
    
    if (!req.config.enableBrowserify) {
      next();
      return;
    }

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;
    
    var browserifyProc = aux.invokeBrowserifyEntriesScript({
      fsRoot: req.fsRoot,
      supportDir: supportDir,
      entries: [
        requestPath
      ],
    });
    
    // pipe stdout to res
    browserifyProc.stdout.pipe(res);
    browserifyProc.stderr.pipe(process.stderr);
    
    browserifyProc.on('error', next);
    browserifyProc.on('exit', function (code) {
      if (code !== 0) {
        console.warn('exited with code ' + code);
        next(new Error('exited with code ' + code));
      }
    });
    
  });
};
