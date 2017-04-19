// native


// third-party
const Bluebird = require('bluebird');
const Vinyl = require('vinyl');

module.exports = function (app, options) {

  /**
   * Array of html injectors
   * @type {Array}
   */
  app.htmlInjectors = [];

  app.addHTMLInjectors = function (injectors) {

    if (!injectors) {
      throw new Error('injectors is required');
    }

    injectors = Array.isArray(injectors) ? injectors : [];

    var currentInjectors = app.htmlInjectors || [];

    app.htmlInjectors = currentInjectors.concat(injectors);
  };

  /**
   * Retrieves all injections for the given file with the given request.
   * @param  {Vinyl} file
   * @param  {Express Req} req
   * @return {Bluebird -> Array[String]}
   */
  app.retrieveHTMLInjections = function (file, projectConfig, req) {

    if (!(file instanceof Vinyl)) {
      throw new Error('file MUST be an instanceof Vinyl');
    }

    if (!req) {
      throw new Error('req is required');
    }

    /**
     * Array of injectors to be executed agains the file.
     * They MUST return either a promise for the injection or the injection
     * string itself.
     * If a falsey value is returned, the injection is not made.
     * 
     * Injections are strings of HTML to be added to
     * the head tag of the document.
     * 
     * @type {Array}
     */
    var htmlInjectors = app.htmlInjectors || [];
    
    var injectionsPromise = Bluebird.all(htmlInjectors.map((injector) => {
      if (typeof injector === 'function') {
        return Bluebird.resolve(injector(file, projectConfig, req));
      } else {
        return Bluebird.resolve(injector);
      }
    }));

    return injectionsPromise.then((injections) => {
      return injections.filter((injection) => {
        return typeof injection === 'string';
      });
    });
  };


};
