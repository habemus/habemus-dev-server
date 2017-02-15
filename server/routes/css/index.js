// native
const fs = require('fs');

// third-party
const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');
const Vinyl        = require('vinyl');
const Bluebird     = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// constants
const CSS_MIME_TYPE = require('mime').lookup('.css');

module.exports = function (app, options) {

  app.get('**/*.css', function (req, res, next) {

    /**
     * An array of processors through which the contents of the file
     * should be run.
     */
    var processors = app.processors[CSS_MIME_TYPE] || [];

    var file = req.file;

    return app.runProcessors(CSS_MIME_TYPE, file, req.projectConfig, req)
      .then(function (file) {
        res.setHeader('Content-Type', CSS_MIME_TYPE);
        res.send(file.contents);
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          next(new app.errors.NotFound(requestPath));
          return;
        } else {
          next(err);
          return;
        }
      });

  });
};
