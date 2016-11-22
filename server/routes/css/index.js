// native
const fs = require('fs');

// third-party
const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');

const Bluebird     = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// constants
const CSS_MIME_TYPE = require('mime').lookup('.css');

module.exports = function (app, options) {

  app.get('**/*.css', function (req, res, next) {

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;

    /**
     * The absolutePath to the file. 
     * MUST NEVER EVER be exposed.
     * 
     * @type {String}
     */
    var absolutePath = req.absolutePath;

    readFileAsync(absolutePath)
      .then((contents) => {
        return postcss([autoprefixer]).process(contents);
      })
      .then(function (result) {
        res.setHeader('Content-Type', CSS_MIME_TYPE);
        res.send(result.css);
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
