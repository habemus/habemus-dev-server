// third-party
const htmlparser2 = require('htmlparser2');
const DomHandler  = require('domhandler');
const DomUtils    = require('domutils');

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

exports.buildDom                = buildDom;
exports.walkDom                 = walkDom;
exports.stringifyDom            = stringifyDom;
exports.createElementFromString = createElementFromString;
