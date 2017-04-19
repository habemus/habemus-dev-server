// native
const fs = require('fs');
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const Vinyl    = require('vinyl');
const WebIO    = require('web-io');
const mime     = require('mime');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// own
const aux = require('../auxiliary');
const HTML_MIME_TYPE = mime.lookup('.html');

module.exports = function (app, options) {

  return function render(req, res, next) {
    
    var requestPath = req.path;
    
    var webIO = new WebIO({
      fsRoot: req.fsRoot,
      websiteRoot: req.websiteRoot || false,
      fs: {
        // TODO: this is not ideal, as webIO only requires
        // readFile method.
        // On the other hand it is hard to solidify the API
        // at this moment.
        // We'll wait for real world scenarios for defining
        // how this API should look like
        readFile: function (absoluteFilePath, encoding, cb) {
          
          var mimeType = mime.lookup(absoluteFilePath);
          var readPromise;
          
          return readFileAsync(absoluteFilePath, 'utf8').then(contents => {
            
            if (mimeType === HTML_MIME_TYPE) {
              return aux.processHTML(contents, {
                hf: webIO.truncateFsRoot(absoluteFilePath),
              });
            } else {
              return contents;
            }
            
          })
          .then(contents => {
            cb(null, contents);
          })
          .catch(cb);
        },
      },
    });
    
    return webIO.renderPath(requestPath).then((rendered) => {
      req.file = new Vinyl({
        cwd: req.fsRoot,
        base: req.fsRoot,
        path: req.absolutePath,
        contents: Buffer.from(rendered, 'utf8'),
      });
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
