// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

function _evalOpt(opt, req) {
  if (typeof opt === 'function') {
    return opt(req);
  } else {
    return opt;
  }
}

function _defaultEvalEnableBrowserify(req) {
  return req.config.packageJson &&
         req.config.packageJson.devDependencies &&
         req.config.packageJson.devDependencies.browserify;
}

module.exports = function (app, options) {
  
  /**
   * Whether to enable browserify or not.
   * Defaults to a function that checks for the presence of
   * a packageJson file and a `browserify` devDependency
   */
  const enableBrowserify = typeof options.enableBrowserify === 'undefined' ?
    _defaultEvalEnableBrowserify : options.enableBrowserify;
  
  /**
   * Loads configuration files into the req object
   * 
   * Files:
   *   package.json
   *   bower.json
   * 
   * Configs:
   *   enableBrowserify
   *   enableLess
   *   enableSass
   */
  app.get('**/*', function loadConfig(req, res, next) {
    
    var config = [
      {
        file: 'package.json',
        as: 'packageJson',
        parse: function (data) {
          return JSON.parse(data);
        }
      },
      {
        file: 'bower.json',
        as: 'bowerJson',
        parse: function (data) {
          return JSON.parse(data);
        }
      }
    ];
    
    /**
     * Define config object on req
     */
    req.config = {};
    
    return Bluebird.all(config.map((cfg) => {
      
      return readFileAsync(
        req.rootPathBuilder.prependTo(cfg.file),
        'utf8'
      )
      .then((fileContents) => {
        
        var data;
        
        try {
          data = cfg.parse(fileContents);
        } catch (err) {
          // silently ignore
          data = null;
        }
        
        req.config[cfg.as] = data;
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          // silently ignore ENOENT
          req.config[cfg.as] = null;
        } else {
          return Bluebird.reject(err);
        }
      })
    }))
    .then(() => {
      /**
       * Evaluate configurations
       */
      req.config.enableBrowserify = _evalOpt(enableBrowserify, req);
      
      next();
    })
    .catch(next);
    
  });  
};
