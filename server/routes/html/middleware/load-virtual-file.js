// native
const fs = require('fs');

// third-party
const Bluebird   = require('bluebird');

const replaceExt = require('replace-ext');

// own
const aux = require('../auxiliary');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

module.exports = function (app, options) {

  return function loadVirtualFile(req, res, next) {
    if (req.file.contents && !req.useVirtualFile) {
      next();
      return;
    }

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;
    var markdownRequestPath = replaceExt(requestPath, '.md');

    /**
     * Markdown path
     * @type {String}
     */
    var markdownFileAbsolutePath = replaceExt(req.absolutePath, '.md');

    return readFileAsync(markdownFileAbsolutePath).then((contents) => {

      // update file
      req.file.path = markdownRequestPath;
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
