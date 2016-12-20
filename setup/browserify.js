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

const errors = require('../shared/errors');
const CONSTANTS = require('../shared/constants');

module.exports = function setupBrowserify(options) {
  
  if (!options) {
    throw new errors.InvalidOption('options', 'required');
  }
  
  var fsRoot = options.fsRoot;
  var supportDir = options.supportDir;
  
  if (!fsRoot) {
    throw new errors.InvalidOption('fsRoot', 'required');
  }
  
  if (!supportDir) {
    throw new errors.InvalidOption('supportDir', 'required');
  }
  
  var absSupportDirPath = path.join(
    fsRoot,
    supportDir,
    CONSTANTS.SUPPORT_BROWSERIFY_PATH
  );
  
  return mkdirpAsync(absSupportDirPath).then(() => {
    return cprAsync(
      path.join(__dirname, '../.tmp-browserify-standalone'),
      absSupportDirPath,
      {
        deleteFirst: true, // Delete "to" before 
        overwrite: true, // If the file exists, overwrite it 
        confirm: true // After the copy, stat all the copied files to make sure they are there 
      }
    );
  });
};
