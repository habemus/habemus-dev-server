/**
 * Browserify files MUST be copied into each project's support
 * directory because the `browserification` will be executed within
 * a chroot.
 * 
 * This script prepares a standalone version of browserify
 * so that the `setup.browserify` method may simply copy
 * the standalone version's files into the project's support directory
 */

// native
const path          = require('path');
const fs            = require('fs');
const child_process = require('child_process');

// third-party
const Bluebird = require('bluebird');
const cpr      = require('cpr');
const pkgUp    = require('pkg-up');

// promisify
const cprAsync = Bluebird.promisify(cpr);

// constants
const BROWSERIFY_MODULE_PATH = path.dirname(pkgUp.sync(require.resolve('browserify')));
const BROWSERIFY_STANDALONE_MODULE_PATH = path.join(__dirname, '../.tmp-browserify-standalone');

return cprAsync(
  BROWSERIFY_MODULE_PATH,
  BROWSERIFY_STANDALONE_MODULE_PATH
)
.then(() => {

  return new Bluebird((resolve, reject) => {

    var command = 'npm install --production --ignore-scripts';

    var ch = child_process.exec(command, {
      cwd: BROWSERIFY_STANDALONE_MODULE_PATH,
    });

    ch.stdout.pipe(process.stdout);
    ch.stderr.pipe(process.stderr);

    ch.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject('install exited with code ' + code);
      }
    });
  });
});
