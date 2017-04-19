// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');
const Vinyl    = require('vinyl');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// constants
const JS_MIME_TYPE = require('mime').lookup('.js');

module.exports = function (app, options) {

  const errors = app.errors;
  
  /**
   * Name of the support directory
   */
  const supportDir = options.supportDir;

  app.get('**/*.js',
    require('../../middleware/load-vinyl-file')(app, options),
    function (req, res, next) {
  
      var file = req.file;
  
      return app.runProcessors(JS_MIME_TYPE, file, req.projectConfig, req).then((file) => {
        
        // pipe stdout to res
        res.setHeader('Content-Type', JS_MIME_TYPE);
        res.send(file.contents);
      })
      .catch((err) => {
        next(err);
      });
    }
  );
};
