// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

module.exports = function (app, options) {
  /**
   * Global get request middleware
   * 
   * Loads configuration files into the req object
   * 
   * Files:
   *   package.json
   *   bower.json
   */
  app.get('**/*', function loadConfigFiles(req, res, next) {
    
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
        
        req[cfg.as] = data;
      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          // silently ignore ENOENT
          req[cfg.as] = null;
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
