// native
const path = require('path');

// third-party
const gulp        = require('gulp');
const gulpNodemon = require('gulp-nodemon');

require('./tasks/content-gen')(gulp);

/**
 * Run server and restart it everytime server file changes
 */
gulp.task('nodemon', function () {
  gulpNodemon({
    script: 'cli/start-with-browserify.js',
    env: {
      PORT: 5001,
      FS_ROOT: path.join(__dirname, 'tmp/markdown-project'),
      // BROWSERIFY_BUNDLE_REGISTRY_URI: 'http://browserify-bundle-registry.io',
      BROWSERIFY_BUNDLE_REGISTRY_URI: 'http://api.habemus.io/browserify-bundle-registry/v0',
    },
    ext: 'js',
    ignore: [
      'tmp',
      'client/**/*',
      'dist/**/*',
      'gulpfile.js',
    ],
  })
});
