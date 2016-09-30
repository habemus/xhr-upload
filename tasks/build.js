'use strict';

const gulpSize   = require('gulp-size');
const gulpUglify = require('gulp-uglify');

// browserify
const browserify = require('browserify');
const source     = require('vinyl-source-stream');
const buffer     = require('vinyl-buffer');
const gutil      = require('gulp-util');

module.exports = function (gulp) {

  gulp.task('javascript', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
      entries: './lib/index.js',
      // debug: true,
      // defining transforms here will avoid crashing your stream
      transform: [],

      // standalone global object for main module
      standalone: 'xhrUpload'
    });

    return b.bundle()
      .on('error', function (err) {
        gutil.log('Browserify Error', err);
        this.emit('end')
      })
      .pipe(source('xhr-upload.js'))
      .pipe(buffer())
      .pipe(gulpUglify())
      // calculate size before writing source maps
      .pipe(gulpSize({
        title: 'javascript:client',
        showFiles: true
      }))
      .pipe(gulp.dest('./dist/'));
  });
};