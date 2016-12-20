/**
 * The main export is the server function
 */
module.exports = require('./server');

/**
 * Setup methods
 */
module.exports.setup = {
  browserify: require('./setup/browserify'),
};
