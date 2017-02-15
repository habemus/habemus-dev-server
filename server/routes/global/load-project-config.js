// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// config gettrs
const CONFIG_GETTERS = [
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

module.exports = function (app, options) {
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
    
    /**
     * Define projectConfig object on req
     */
    req.projectConfig = {};
    
    return Bluebird.all(CONFIG_GETTERS.map((cfg) => {
      
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
        
        req.projectConfig[cfg.as] = data;
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          // silently ignore ENOENT
          req.projectConfig[cfg.as] = null;
        } else {
          return Bluebird.reject(err);
        }
      })
    }))
    .then(() => {
      next();
    })
    .catch(next);
    
  });  
};
