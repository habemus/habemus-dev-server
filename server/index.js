// native

// third-party
const express  = require('express');
const Bluebird = require('bluebird');

// own dependencies
const errors = require('../shared/errors');

/**
 * Creates an express app that serves development-suited html5 assets
 */
function devServerHTML5(options) {
  if (!options.apiVersion) { throw new Error('apiVersion is required'); }
  if (!options.supportDir) { throw new Error('supportDir is required'); }
  if (!options.browserifyBundleRegistryURI) { throw new Error('browserifyBundleRegistryURI is required'); }

  // create express app instance
  var app = express();

  // make the error constructors available throughout the application
  app.errors = errors;

  // constants
  app.constants = require('../shared/constants');

  // services
  app.services = {};

  // instantiate controllers
  app.controllers = {};

  // instantiate services
  app.services = {
    setupBrowserify: require('./services/setup-browserify')(app, options),
  };

  /**
   * List of html injections
   */
  var htmlInjections = options.htmlInjections || [];
  htmlInjections.push(
    require('./injectors/browserify-bundle').bind(null, app, options)
  );
  app.set('htmlInjections', htmlInjections);
  
  
  require('./routes/global/parse-paths')(app, options);
  require('./routes/global/load-config')(app, options);
  
  /**
   * Route load order is very important as middleware
   * actually process files before serving them.
   */
  require('./routes/html')(app, options);
  require('./routes/css')(app, options);
  require('./routes/js')(app, options);
  
  require('./routes/fallback')(app, options);

  // load error-handlers
  require('./error-handlers/dev-server-html5')(app, options);

  return app;
}

/**
 * Expose errors object
 */
devServerHTML5.errors = errors;

module.exports = devServerHTML5;
