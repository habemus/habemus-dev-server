// native
const path = require('path');

// third-party
const gulp        = require('gulp');
const runSequence = require('run-sequence');
const gulpNodemon = require('gulp-nodemon');

// browserSync
var browserSync = require('browser-sync').create();


// SERVER //

/**
 * Run server and restart it everytime server file changes
 */
gulp.task('nodemon', function () {
  gulpNodemon({
    script: 'cli/start.js',
    env: {
      PORT: 4000,
    },
    ext: 'js',
    ignore: [
      'client/**/*',
      'dist/**/*',
      'gulpfile.js',
    ],
  })
});
