// own
const aux = require('../auxiliary');

// constants
const HTML_MIME_TYPE = require('mime').lookup('.html');

/**
 * Auxiliary function that injects a set of html strings into a given element
 */
function _injectHTMLStrings(element, injections) {
  injections.forEach(function (injection) {
    var injectedElement = aux.createElementFromString(injection);

    // inject elements
    // use unshift in order to guarantee element goes before others
    element.children.unshift(injectedElement);
  });
}

module.exports = function (app, options) {

  return function injectAndSend(req, res, next) {

    /**
     * The path that ignores the existence of the fsRoot
     * 
     * @type {String}
     */
    var requestPath = req.path;
    
    /**
     * Flag that defines whether injections should be done for
     * the request. For now, checks whether the request was
     * originated by an xhr request and IF NOT requires the injections.
     * @type {Boolean}
     */
    var _shouldInject = !req.xhr;

    var file = req.file;

    return app.retrieveHTMLInjections(file, req.projectConfig, req).then((injections) => {
      /**
       * Flag that is set to true once injections
       * have been done.
       * @type {Boolean}
       */
      var _injectionsDone = false;
      var dom = aux.buildDom(file.contents.toString('utf8'));

      aux.walkDom(dom, function (element) {
        if (element.type === 'tag') {
          // // hf  = habemus filepath
          // // hsi = habemus start index
          // // hei = habemus end index
          // element.attribs['data-hf'] = requestPath;
          // element.attribs['data-hsi'] = element.startIndex;
          // element.attribs['data-hei'] = element.endIndex;

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

      res.setHeader('Content-Type', HTML_MIME_TYPE);
      res.send(markedHTML);
    })
    .catch((err) => {
      next(err);
    });
  };

};
