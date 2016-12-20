/**
 * This script is run within a chroot, so that all `requires` have no
 * access to outside world.
 * 
 * It expects `browserify` node module to be available within the chroot.
 */

// native
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const posix = require('posix');

// own
const options   = require('./options');
const CONSTANTS = require('../../shared/constants');

if (!options.fsRoot) {
  throw new Error('fsRoot is required');
}

if (!options.supportDir) {
  throw new Error('supportDir is required');
}

if (!options.entries) {
  throw new Error('entries are required');
}

return new Bluebird((resolve, reject) => {
  
  posix.chroot(options.fsRoot);
  process.chdir('/');
  
  const browserify = require(
    path.join(
      '/',
      options.supportDir,
      CONSTANTS.SUPPORT_BROWSERIFY_PATH
    )
  );
  
  var b = browserify({
    entries: options.entries,
    debug: true,
    standalone: options.standalone || false,
    bundleExternal: false,
    builtins: true,
  });
  
  var stream = b.bundle();
    
  stream.pipe(process.stdout);
  
  stream.on('error', (err) => {
    reject(err);
  });
  
  stream.on('end', () => {
    resolve();
  });
  
})
.then(() => {
  // exit
  process.exit(0);
})
.catch((err) => {
  console.warn(err.stack);
  process.exit(1);
});
