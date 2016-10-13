// native
const fs = require('fs');

// third-party
const Bluebird = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

// own
const aux = require('./auxiliary');

/**
 * Auxiliary function that injects a set of html strings into a given element
 */
function _injectHTMLStrings(element, injections) {
  injections.forEach(function (injection) {
    var injectedElement = aux.createElementFromString(injection);

    // inject elements
    element.children.push(injectedElement);
  });
}

module.exports = function (app, options) {

  const errors = app.errors;

  app.get('**/*.html', function (req, res, next) {

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;

    /**
     * The absolutePath to the file. 
     * MUST NEVER EVER be exposed.
     * 
     * @type {String}
     */
    var absolutePath = req.absolutePath;

    /**
     * Flag that defines whether injections should be done for
     * the request. For now, checks whether the request was
     * originated by an xhr request and IF NOT requires the injections.
     * @type {Boolean}
     */
    var _shouldInject = !req.xhr;

    /**
     * Array of injections to be made.
     * Injections are strings of HTML to be added to
     * the head tag of the document.
     * @type {Array}
     */
    var injections = app.get('htmlInjections') || [];

    readFileAsync(absolutePath, 'utf8')
      .then((contents) => {
        /**
         * Flag that is set to true once injections
         * have been done.
         * @type {Boolean}
         */
        var _injectionsDone = false;
        var dom = aux.buildDom(contents);

        aux.walkDom(dom, function (element) {
          if (element.type === 'tag') {
            // hf  = habemus filepath
            // hsi = habemus start index
            // hei = habemus end index
            element.attribs['data-hf'] = requestPath;
            element.attribs['data-hsi'] = element.startIndex;
            element.attribs['data-hei'] = element.endIndex;

            // by default, add the injections in the head element
            if (element.name === 'head') {

              _injectHTMLStrings(element, injections);

              // set injections as done
              _injectionsDone = true;
            }
          }
        });

        if (!_injectionsDone) {
          // if after parsing the DOM the injections were not made
          // (that may happen if the document has no `head` element)
          // force the injection and add them to the end of the document
          dom = dom.concat(injections.map(function (injection) {
            return aux.createElementFromString(injection);
          }));
        }

        var markedHTML = aux.stringifyDom(dom);
        res.send(markedHTML);

      })
      .catch((err) => {
        if (err.code === 'ENOENT') {
          next(new errors.NotFound(requestPath));
          return;
        } else {
          next(err);
          return;
        }
      });
  });
}