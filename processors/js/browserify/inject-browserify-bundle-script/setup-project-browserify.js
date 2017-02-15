// native
const path = require('path');
const fs   = require('fs');

// third-party
const Bluebird = require('bluebird');
const cpr      = require('cpr');
const mkdirp   = require('mkdirp');

// promisify
Bluebird.promisifyAll(fs);
const cprAsync = Bluebird.promisify(cpr);
const mkdirpAsync = Bluebird.promisify(mkdirp);

// constants
const BROWSERIFY_STANDALONE_PATH = path.join(__dirname, '../../../../.tmp-browserify-standalone')

module.exports = function (app, options) {

  // constants
  const errors     = app.errors;
  const supportDir = options.supportDir;

  var setup = {};

  /**
   * Sets up browserify support files
   * @param  {Path} fsRoot
   * @return {Bluebird -> undefined}
   */
  setup.setup = function (fsRoot) {

    if (!fsRoot) {
      throw new errors.InvalidOption('fsRoot', 'required');
    }
    
    var absSupportDirPath = path.join(
      fsRoot,
      supportDir,
      app.constants.SUPPORT_BROWSERIFY_PATH
    );
    
    return mkdirpAsync(absSupportDirPath).then(() => {
      return cprAsync(
        BROWSERIFY_STANDALONE_PATH,
        absSupportDirPath,
        {
          deleteFirst: true, // Delete "to" before 
          overwrite: true, // If the file exists, overwrite it 
          confirm: true // After the copy, stat all the copied files to make sure they are there 
        }
      );
    })
    .then(() => {
      // ensure nothing is returned
      return;
    });
  };

  /**
   * Checks whether the support files for browserify are in place
   * and sets up ONLY IF REQUIRED
   * @param  {Path} fsRoot
   * @return {Bluebird -> undefined}
   */
  setup.ensureSetup = function (fsRoot) {
    if (!fsRoot) {
      throw new errors.InvalidOption('fsRoot', 'required');
    }
    
    var absSupportDirPath = path.join(
      fsRoot,
      supportDir,
      app.constants.SUPPORT_BROWSERIFY_PATH
    );

    return fs.statAsync(absSupportDirPath).then((stats) => {
      // ok
      console.log('setup ok');
      return;
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        console.log('setup required');
        return setup.setup(fsRoot);
      } else {
        throw err;
      }
    })
  };

  return setup;
};
