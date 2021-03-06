// native
const fs        = require('fs');
const NODE_PATH = require('path');

// third-party
const rootPathBuilder = require('root-path-builder');
const Bluebird        = require('bluebird');

// promisify
const lstatAsync = Bluebird.promisify(fs.lstat);
const readFileAsync = Bluebird.promisify(fs.readFile);

// constants
const TRAILING_SLASH_RE = /\/$/;

module.exports = function (app, options) {
  
  /**
   * Global get request middleware
   *
   * Checks for required fsRoot property set onto req object
   * and instantiates a rootPathBuilder (set to req.rootPathBuilder) object to be used
   * in the following middleware.
   *
   * Defines the `absolutePath` property onto req, so
   * that further middleware already know which path is the desired one.
   * Ensures that the absolutePath does not point to a directory
   */
  app.get('**/*', function parsePaths(req, res, next) {

    if (!req.fsRoot) {
      next(new Error('No fsRoot set on request object'));
      return;
    }

    var requestPath = req.path;

    if (requestPath === '' || requestPath === '/') {
      // in case the request's path is for the root,
      // forcefully redirect the request to to index.html
      // and return
      var baseUrl;

      if (typeof options.baseUrl === 'function') {
        baseUrl = options.baseUrl(req);
      } else if (typeof options.baseUrl === 'string') {
        baseUrl = options.baseUrl;
      } else {
        baseUrl = req.baseUrl || '';
      }
      res.redirect(baseUrl.replace(TRAILING_SLASH_RE, '') + '/index.html');
      return;
    }

    /**
     * Expose the path builder
     * @type {RootPathBuilder}
     */
    req.rootPathBuilder = rootPathBuilder(req.fsRoot);

    // build the `absolutePath` by prepending the `fsRoot` to the requestPath
    var absolutePath = req.rootPathBuilder.prependTo(requestPath);

    // check if the absolutePath is a directory
    // use lstat in order not to follow any symlinks
    lstatAsync(absolutePath)
      .then((stats) => {

        if (stats.isDirectory()) {

          // redirect to the 'index.html' within the directory
          var baseUrl = (req.baseUrl || '').replace(TRAILING_SLASH_RE, '');
          res.redirect(baseUrl + req.path.replace(TRAILING_SLASH_RE, '') + '/index.html');
          return;

        } else if (stats.isFile()) {

          // ok to go
          req.absolutePath = absolutePath;
          next();
          return;

        } else {
          // only directory and files are supported
          // TBD: it might be good to use another error
          // and handle it as 404.
          // for now, simply use NotFound
          next(new app.errors.NotFound(absolutePath));
          return;
        }

      })
      .catch((err) => {

        if (err.code === 'ENOENT') {
          // if the path has no extension, redirect it to an `.html` path
          var extname = NODE_PATH.extname(requestPath);

          if (extname === '' || extname === '.') {
            var baseUrl = (req.baseUrl || '').replace(TRAILING_SLASH_RE, '');
            res.redirect(baseUrl + req.path.replace(TRAILING_SLASH_RE, '') + '.html');
            return;
          } else {
            // though we already know that the file does not exist,
            // we must let further middleware to return NotFound
            // or not, as files might be compiled on the fly
            
            req.absolutePath = absolutePath;
            next();
            return;
          }

        } else {
          // unknown error, error immediately
          next(err);
          return;
        }
      });
  });
};
