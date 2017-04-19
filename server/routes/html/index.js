// native
const fs = require('fs');

// third-party
const Bluebird   = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

/**
 * Auxiliary function that checks whether webIO should be
 * enabled for the given projectConfig
 * 
 * @param  {Object}  projectConfig
 * @return {Boolean}
 */
function isWebIOEnabled(projectConfig) {
  return projectConfig.packageJson &&
         projectConfig.packageJson.devDependencies &&
         projectConfig.packageJson.devDependencies['web-io'];
}

// own
const aux = require('./auxiliary');
module.exports = function (app, options) {

  const errors = app.errors;
  
  const middleware = {
    renderWebIO: require('./middleware/render-web-io')(app, options),
    serveHTML: require('./middleware/serve-html')(app, options),
    injectAndSend: require('./middleware/inject-and-send')(app, options),
  };
  
  app.get('**/*.html',
    function (req, res, next) {
      
      var webIOEnabled = isWebIOEnabled(req.projectConfig);
      if (webIOEnabled) {
        middleware.renderWebIO(req, res, next);
      } else {
        middleware.serveHTML(req, res, next);
      }
    },
    middleware.injectAndSend
  );

};
