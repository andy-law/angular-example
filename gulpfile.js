/* jshint node:true */

'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

// Sass
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var chalk = require('chalk');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');


// Browserify
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var browserify = require('browserify');
var stringify = require('stringify');
var source = require('vinyl-source-stream');

function logTask(msg){
	gutil.log(chalk.cyan(msg));
}

function logError(error) {
	gutil.log(error.toString());
	gutil.beep();
}

function compileSass(callback){
	return gulp.src('./src/sass/app.scss')
		.pipe(plumber({
			errorHandler: callback
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['Chrome >= 27'],
			cascade: false
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./assets/css'))
		.on('end', callback);
}

gulp.task('sass', function(callback){
	compileSass(callback);
});

gulp.task('serve', ['sass'], function(){
	browserSync({
		server: {
			baseDir: '.'
		}
	});
});

gulp.task('watch', ['serve'], function(){

	watch('./src/**/*.scss', function(){
		logTask('SASS task triggered');
		compileSass(function(error) {
			if (error) {
				logError(error);
			} else {
				logTask('SASS task finished');
			}
		});
	});

	watch('./src/**/*.js', function() {
		logTask('JS task triggered');
		browserify('./src/app/app.js')
			.transform(stringify(['.html']))
			.bundle()
			.pipe(source('app.js'))
			.pipe(gulp.dest('./assets/js/'));
	});

	watch([
		'*.html',
		'./assets/css/**/*',
		'./src/app/**/*.{html,js,json}'
	], function(change) {
		browserSync.reload(change.path);
	});

	browserSync.reload();
});