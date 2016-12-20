// third-party
const gulp        = require('gulp');
const gulpNodemon = require('gulp-nodemon');

/**
 * Run server and restart it everytime server file changes
 */
gulp.task('nodemon', function () {
  gulpNodemon({
    script: 'cli/start.js',
    env: {
      PORT: 5001,
    },
    ext: 'js',
    ignore: [
      'client/**/*',
      'dist/**/*',
      'gulpfile.js',
    ],
  })
});

/**
 * Run server and restart it everytime server file changes
 */
gulp.task('nodemon:with-browserify', function () {
  gulpNodemon({
    script: 'cli/start-with-browserify.js',
    env: {
      PORT: 5000,
      BROWSERIFY_BUNDLE_REGISTRY_URI: 'http://browserify-bundle-registry.io',
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
