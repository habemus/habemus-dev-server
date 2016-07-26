// external dependencies
const express = require('express');
const vroot   = require('vroot');

// own dependencies
const errors = require('../shared/errors');

/**
 * Creates an express app that serves development-suited html5 assets
 */
function createDevServerHTML5(options) {
  if (!options.apiVersion) { throw new Error('apiVersion is required'); }

  // create express app instance
  var app = express();

  // make the error constructors available throughout the application
  app.errors = errors;

  // constants
  app.constants = require('../shared/constants');

  /**
   * List of html injections
   */
  options.htmlInjections = options.htmlInjections || [];
  app.set('htmlInjections', options.htmlInjections);

  // services
  app.services = {};

  // instantiate controllers
  app.controllers = {};

  // setup global middleware
  require('./app/setup/middleware')(app, options);

  // define description route
  app.get('/who', function (req, res) {
    var msg = app.format.item({ name: 'dev-server-html5' }, { name: true });
    res.json(msg);
  });

  /**
   * Global get request middleware
   *
   * Checks for required projectRoot property set onto req object
   * and instantiates a vroot (set to req.vfs) object to be used
   * in the following middleware.
   */
  app.get('**/*', function buildFilepath(req, res, next) {

    if (!req.projectRoot) {
      next(new Error('No projectRoot set on request object'));
      return;
    }

    req.vfs = vroot(req.projectRoot);

    next();
  });

  // load routes
  require('./app/routes/html')(app, options);
  require('./app/routes/other')(app, options);

  // load error-handlers
  require('./app/error-handlers/dev-server-html5')(app, options);

  return app;
}

module.exports = createDevServerHTML5;
