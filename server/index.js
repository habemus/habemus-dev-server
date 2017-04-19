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

  // create express app instance
  var app = express();

  // make the error constructors available throughout the application
  app.errors = errors;

  // assign methods to the application
  require('./app-methods')(app, options);

  // constants
  app.constants = require('../shared/constants');

  // add processors passed as options
  if (options.processors) {
    Object.keys(options.processors).forEach((mimeType) => {
      app.addProcessors(mimeType, options.processors[mimeType]);
    });
  }

  // add html injectors passed as options
  if (options.htmlInjectors) {
    app.addHTMLInjectors(options.htmlInjectors);
  }

  // load global route middleware
  require('./routes/global/parse-paths')(app, options);
  require('./routes/global/load-project-config')(app, options);
  // require('./routes/global/load-file')(app, options);

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
