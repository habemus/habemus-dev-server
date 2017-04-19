// native
const fs = require('fs');

// third-party
const htmlparser2 = require('htmlparser2');
const DomHandler  = require('domhandler');
const DomUtils    = require('domutils');
const Bluebird    = require('bluebird');

// promisify
const readFileAsync = Bluebird.promisify(fs.readFile);

/**
 * Builds a dom object from an html string
 * @param {String} htmlSource
 * @return {Array[Object]} dom
 */
function buildDom(htmlSource) {

  // SEE:
  // https://github.com/fb55/htmlparser2/blob/master/lib/index.js#L39-L43
  // create new handler
  var handler = new DomHandler({
    withStartIndices: true,
    withEndIndices: true,
  });

  var parser = new htmlparser2.Parser(handler);

  parser.end(htmlSource);

  return handler.dom;
}

/**
 * Walks all the dom tree
 * @param  {Object[]} elements - elements from which to walk the dom tree.
 * @param  {Function} callback - function called at each dom element.
 */
function walkDom(elements, callback) {
  for (var i = 0; i < elements.length; i++) {
    var currEl = elements[i];

    callback(currEl);

    if (currEl.type === 'tag' && currEl.children.length > 0) {
      walkDom(currEl.children, callback);
    }
  }
}

/**
 * Stringifies a dom object into html using an optional
 * element callback
 * @param  {Array[Object]} dom
 * @param  {Function} elementCb 
 * @return {String}
 */
function stringifyDom(dom, elementCb) {

  if (elementCb) {
    walkDom(dom, function (element) {
      elementCb(element, dom);
    });
  }
    
  return DomUtils.getOuterHTML(dom);
}

/**
 * Helper function that builds a DOM and returns the first element
 * built from the string
 * @param  {String} html
 * @return {Object}
 */
function createElementFromString(html) {
  return buildDom(html)[0];
}

/**
 * Helper function that processes an HTML string into
 * the front-matter data and the file contents already with
 * marked tags.
 * @param  {String} html
 * @param  {Object} options
 *         - projectPath
 * @return {Object}
 *         - contents
 *         - data
 */
function processHTML(html, options) {

  return new Bluebird((resolve, reject) => {

    if (!options) {
      throw new Error('options is required');
    }

    if (!options.hf) {
      throw new Error('options.hf is required');
    }

    var dom = buildDom(html);

    walkDom(dom, function (element) {
      if (element.type === 'tag') {
        // hf  = habemus filepath
        // hsi = habemus start index
        // hei = habemus end index
        element.attribs['data-hf']  = options.hf;
        element.attribs['data-hsi'] = element.startIndex;
        element.attribs['data-hei'] = element.endIndex;
      }
    });

    var markedHTML = stringifyDom(dom);
    
    resolve(markedHTML);
  });
}

function readHTML(filepath, options) {
  return readFileAsync(filepath, 'utf8').then((contents) => {
    return processHTML(contents, options);
  });
}

exports.buildDom                = buildDom;
exports.walkDom                 = walkDom;
exports.stringifyDom            = stringifyDom;
exports.createElementFromString = createElementFromString;

exports.processHTML     = processHTML;
exports.readHTML        = readHTML;
