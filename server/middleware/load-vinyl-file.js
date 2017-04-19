// native
const fs = require('fs');

// third-party
const Vinyl        = require('vinyl');
const Bluebird     = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

module.exports = function (app, options) {

  return function loadVinylFile(req, res, next) {

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

    /**
     * Create an empty vinyl file
     * @type {Vinyl}
     */
    var file = new Vinyl({
      cwd: req.fsRoot,
      base: req.fsRoot,
      path: absolutePath,
      contents: null,
    });

    req.file = file;

    readFileAsync(absolutePath)
      .then((contents) => {

        // fill in file contents
        req.file.contents = contents;

        next();
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

  };
};
