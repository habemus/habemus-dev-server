// native
const fs = require('fs');

// third-party
const mime     = require('mime');
const Bluebird = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

module.exports = function (app, options) {

  const errors = app.errors;

  /**
   * This is the last middleware to be called.
   * For html and css files, requests should not even arrive here,
   * but be answered before.
   */
  app.get('**/*', function serveProjectStaticFiles(req, res, next) {

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

    var mimeType = mime.lookup(absolutePath);

    readFileAsync(absolutePath)
      .then((contents) => {
        res.setHeader('Content-Type', mimeType);
        res.send(contents);
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          next(new errors.NotFound(requestPath));
          return;
        } else {
          next(err);
          return;
        }
      });
  });
}
