// native
const fs = require('fs');
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const WebIO    = require('web-io');
const mime     = require('mime');
const replaceExt = require('replace-ext');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// own
const aux = require('../auxiliary');
const HTML_MIME_TYPE = mime.lookup('.html');

/**
 * Constructor for the fs module used in the WebIO
 */
function WebIOFs(fsRoot) {
  this.fsRoot = fsRoot;
}

WebIOFs.prototype.readFile = function (absoluteFilePath, encoding, cb) {
  
  var mimeType = mime.lookup(absoluteFilePath);
  var fsRoot = this.fsRoot;
  
  var readPromise;
  
  if (mimeType === HTML_MIME_TYPE) {
    readPromise = aux.readHTML(absoluteFilePath, {
      // TODO: separate logic of building relative path
      hf: '/' + require('path').relative(fsRoot, absoluteFilePath)
    });
  } else {
    readPromise = readFileAsync(absoluteFilePath, encoding);
  }
  
  return readPromise.then((contents) => {
    cb(null, contents);
  })
  .catch(cb);
};


module.exports = function (app, options) {

  return function render(req, res, next) {
    
    var webIO = new WebIO({
      fsRoot: req.fsRoot,
      fs: new WebIOFs(req.fsRoot),
      
      websiteRoot: req.websiteRoot || false,
    });
    
    return webIO.renderTemplate(req.path).then((rendered) => {
      req.file.contents = Buffer.from(rendered, 'utf8');
      next();
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return webIO.renderTemplate(replaceExt(req.path, '.md')).then((rendered) => {
          req.file.contents = Buffer.from(rendered, 'utf8');
          next();
        })
      } else {
        next(err);
      }
    })
    .catch(next);
  };
};
