// native


// third-party
const mime = require('mime');
const Bluebird = require('bluebird');
const Vinyl = require('vinyl');

// constants
const SUPPORTED_MIME_TYPES = [
  mime.lookup('.js'),
  mime.lookup('.html'),
  mime.lookup('.css'),
];

module.exports = function (app, options) {

  /**
   * Hash that holds processors by mimeType
   * @type {Object}
   */
  app.processors = {};

  /**
   * Add processors to a given mimeTypw
   * @param {String} mimeType
   * @param {Array[Function|Object]} processors
   */
  app.addProcessors = function (mimeType, processors) {
    if (!mimeType) {
      throw new Error('mimeType is required');
    }

    if (SUPPORTED_MIME_TYPES.indexOf(mimeType) === -1) {
      throw new Error('unsupported mimeType ' + mimeType);
    }

    if (!processors) {
      throw new Error('processors is required');
    }

    processors = Array.isArray(processors) ? processors : [processors];

    // processors must be instantiated
    processors = processors.map((makeProcessor) => {
      return makeProcessor(app, options);
    });

    // in case any processors have an embedded injector, add them
    processors.forEach((processor) => {
      if (processor.htmlInjectors) {
        app.addHTMLInjectors(processor.htmlInjectors);
      }
    });

    var currentProcessors = app.processors[mimeType] || [];

    app.processors[mimeType] = currentProcessors.concat(processors);
  };

  /**
   * Executes the processors defined for the given mimeType
   * with the contents.
   * 
   * @param  {String} mimeType
   * @param  {Vinyl} file
   * @param  {Express Req} req
   * @return {Bluebird}
   */
  app.runProcessors = function (mimeType, file, projectConfig, req) {

    if (!mimeType) {
      throw new Error('mimeType is required');
    }

    if (SUPPORTED_MIME_TYPES.indexOf(mimeType) === -1) {
      throw new Error('unsupported mimeType ' + mimeType);
    }

    if (!(file instanceof Vinyl)) {
      throw new Error('file MUST be an instanceof Vinyl');
    }

    if (!projectConfig) {
      throw new Error('projectConfig is required');
    }

    if (!req) {
      throw new Error('req is required');
    }

    var processors = app.processors[mimeType] || [];

    return processors.reduce((lastPromise, processor) => {

      return lastPromise.then((file) => {

        // processors may be a function
        // or an object with the `exec` property
        if (typeof processor === 'function') {
          return Bluebird.resolve(processor(file, req));
        } else if (typeof processor.exec === 'function') {
          return Bluebird.resolve(processor.exec(file, projectConfig, req));
        } else {
          throw new Error('invalid processor', processor);
        }
      });

    }, Bluebird.resolve(file));

  };

};
