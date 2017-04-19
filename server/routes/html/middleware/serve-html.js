// native
const fs = require('fs');
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const Vinyl = require('vinyl');

// own
const aux = require('../auxiliary');

module.exports = function (app, options) {

  return function serveHTML(req, res, next) {
    
    var requestPath = req.path;
    
    return aux.readHTML(req.absolutePath, {
      hf: requestPath,
    })
    .then(processed => {
      req.file = new Vinyl({
        cwd: req.fsRoot,
        base: req.fsRoot,
        path: req.absolutePath,
        contents: Buffer.from(processed, 'utf8'),
      });
      // req.file.contents = Buffer.from(processed, 'utf8');
      next();
    })
    .catch(err => {
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
