// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');
const mime     = require('mime');
const glob     = require('glob');
const replaceExt = require('replace-ext');

// own
const aux = require('../auxiliary');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);
const globAsync = Bluebird.promisify(glob);

// constants
const DATA_PROP_RE = /@$/;

const MARKDOWN_MIME_TYPE = mime.lookup('.md');
const HTML_MIME_TYPE = mime.lookup('.html');

module.exports = function (app, options) {
  
  var dataLoaders = {};
  
  dataLoaders.fs = function (req, glob) {
    
    var absoluteGlob = req.rootPathBuilder.prependTo(glob);
    
    return globAsync(absoluteGlob, {}).then((filePaths) => {
      
      filePaths = filePaths.sort();
      
      console.log(filePaths);
      
      return Bluebird.all(filePaths.map((filePath) => {
        switch (mime.lookup(filePath)) {
          case MARKDOWN_MIME_TYPE:
            return aux.readMarkdown(filePath).then((parsed) => {
              return Object.assign({}, parsed.data, {
                content: parsed.content,
                
                // useful metadata
                url: replaceExt(require('path').relative(req.fsRoot, filePath), '.html'),
              });
            });
            break;
          case HTML_MIME_TYPE:
            return aux.readHTML(filePath, { fileProjectPath: require('path').relative(req.fsRoot, filePath) }).then((parsed) => {
              return Object.assign({}, parsed.data, {
                content: parsed.content,
                
                // useful metadata
                url: require('path').relative(req.fsRoot, filePath),
              });
            });
            break;
          default:
            return readFileAsync(filePath);
            break;
        }
      }));
    });
  };

  return function loadData(req, res, next) {
    
    var frontMatter = req.frontMatter;
    
    if (!frontMatter) {
      next();
      return;
    }
    
    var frontMatterProps = Object.keys(frontMatter);
    
    var dataProps = frontMatterProps.filter(prop => {
      return DATA_PROP_RE.test(prop);
    });
    
    var loadDataPromises = dataProps.map(prop => {
      return dataLoaders.fs(req, frontMatter[prop]).then((data) => {
        frontMatter[prop.replace(DATA_PROP_RE, '')] = data;
      });
    });
    
    return Bluebird.all(loadDataPromises).then(() => {
      next();
    });

  };
};
