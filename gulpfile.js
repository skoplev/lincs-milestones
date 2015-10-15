/*
 * Gulpfile
 * @author Michael McDermott
 * Created on 5/12/15.
 */

'use strict';

var gulp = require('gulp');
var path = require('path');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var argv = require('minimist')(process.argv.slice(2));
var $ = require('gulp-load-plugins')();

gulp.task('js', function() {
  var jsChain = gulp.src('public/scripts/grid/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.concat('grid.min.js', { newLine: ';' }))
    .pipe(ngAnnotate({ add: true }));
  // Only uglify if production
  if (argv.production) {
    jsChain = jsChain.pipe($.uglify({ mangle: true }));
  }
  jsChain = jsChain
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('public/scripts'));
  return jsChain;
});

gulp.task('scss', function() {
  return gulp.src('public/SCSS/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer())
    .pipe(minifyCss())
    .pipe($.sourcemaps.write())
    .pipe($.concat('grid.min.css'))
    .pipe(gulp.dest('public/CSS'));
});

gulp.task('default', ['scss', 'js']);
