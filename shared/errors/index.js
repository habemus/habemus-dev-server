// native
const util = require('util');

/**
 * Base Error constructor for dev-server-html5 module
 * @param {String} message
 */
function DevServerHTML5Error(message) {
  Error.call(this, message);
}
util.inherits(DevServerHTML5Error, Error);
DevServerHTML5Error.prototype.name = 'DevServerHTML5Error';

/**
 * Occurs whenever a path results in no corresponding file
 * @param {String} path Requested path
 */
function NotFound(path) {
  var msg = 'Path not found: ' + path;
  DevServerHTML5Error.call(this, msg);

  this.path = path;
}
util.inherits(NotFound, DevServerHTML5Error);
NotFound.prototype.name = 'NotFound';

exports.DevServerHTML5Error = DevServerHTML5Error;
exports.NotFound = NotFound;