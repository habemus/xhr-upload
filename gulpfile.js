// third-party dependencies
const gulp        = require('gulp');
const runSequence = require('run-sequence');

// browserSync
const browserSync = require('browser-sync').create();

const testAux = require('./test/aux');

// load build tasks
require('./tasks/build')(gulp);

/**
 * Starts auxiliary test servers and the main test scripts
 */
gulp.task('test:browser', ['javascript'], function() {

  testAux.setup()
    .then((assets) => {

    });

  browserSync.init({
    server: {
      baseDir: ['./test/tests', './dist']
    },
    open: true,
    startPath: 'tests.html',
  });
});

gulp.task('distribute', ['javascript'])
