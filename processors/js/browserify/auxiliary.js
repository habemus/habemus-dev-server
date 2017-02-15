// native
const path = require('path');
const child_process = require('child_process');

// third-party
const Bluebird = require('bluebird');

// constants
const browserifyEntryScriptPath = path.join(__dirname, '../../../scripts/browserify-entry');

/**
 * Invokes the browserify entries script
 * @param {Object} options
 *         - fsRoot: String
 *         - supportDir: String
 *         - entries: Array
 */
exports.invokeBrowserifyEntriesScript = function (options) {
  
  var fsRoot     = options.fsRoot;
  var supportDir = options.supportDir;
  var entries    = options.entries;
  
  if (!fsRoot) {
    throw new Error('fsRoot is required');
  }
  
  if (!supportDir) {
    throw new Error('supportDir is required');
  }
  
  if (!entries) {
    throw new Error('entries are required');
  }
  
  entries = Array.isArray(entries) ? entries : [entries];
  
  var args = [
    browserifyEntryScriptPath,
    '--fs-root', fsRoot,
    '--support-dir', supportDir,
  ];
  
  entries.forEach((entry) => {
    args.push('--entry');
    args.push(entry);
  });
        
  var proc = child_process.execFile('node', args, {
    // max buffer for stdout and stderr
    // it is a hard limit on the bundle's size
    maxBuffer: 1000 * 1024,
  });
  
  return proc;
};

/**
 * Auxiliary function that checks whether browserify should be
 * enabled for the given projectConfig
 * 
 * @param  {Object}  projectConfig
 * @return {Boolean}
 */
exports.hasBrowserifyEnabled = function (projectConfig) {
  return projectConfig.packageJson &&
         projectConfig.packageJson.devDependencies &&
         projectConfig.packageJson.devDependencies.browserify;
};
