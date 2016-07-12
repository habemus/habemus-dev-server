// native
const path = require('path');

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

  /**
   * The index.html file is a special case
   */
  app.get('**/*.html', function (req, res, next) {

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

    req.vfs.readFile(req.path, 'utf8', function (err, contents) {

      if (err) {
        if (err.code === 'ENOENT') {
          // ATTENTION: NotFound errors should
          // be dealt with outside dev-server-html5
          next(new errors.NotFound(req.path));
        } else {
          next(err);
        }
        return;
      }

      /**
       * Flag that is set to true once injections
       * have been done.
       * @type {Boolean}
       */
      var _injectionsDone = false;
      var dom = aux.buildDom(contents);

      aux.walkDom(dom, function (element) {
        if (element.type === 'tag') {

          // build an id string for the element
          var hid = req.path + '-' + element.startIndex + '-' + element.endIndex;

          element.attribs['data-hid'] = hid;

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

      res.send(aux.stringifyDom(dom));
    });
  });
}