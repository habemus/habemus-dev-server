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
 * Happens when any required option is invalid
 *
 * error.option should have the option that is invalid
 * error.kind should contain details on the error type
 * 
 * @param {String} option
 * @param {String} kind
 * @param {String} message
 */
function InvalidOption(option, kind, message) {
  DevServerHTML5Error.call(this, message);

  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, DevServerHTML5Error);
InvalidOption.prototype.name = 'InvalidOption';
exports.InvalidOption = InvalidOption;

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