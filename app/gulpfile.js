var gulp = require('gulp');
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var del = require('del');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');
var exec = require('child_process').exec;
var fs = require('fs');
//var Server = require('karma').Server;
//var jshint = require('gulp-jshint');


function moveHTML() {
  return gulp.src(['src/templates/**/*.html'])
    .pipe(gulp.dest('build/app/templates'));
}

function moveVendorSrc() {
  return gulp.src(['src/vendor/**/*'])
    .pipe(sort())
    .pipe(gulp.dest('build/app/vendor'));
}

function buildJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(sort())
    .pipe(concat('app.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('build/app/js'));
}

function buildCSS() {
  return gulp.src('src/css/**/*.css')
    .pipe(sort())
    .pipe(concat('styles.css'))
    .pipe(cleancss())
    .pipe(gulp.dest('build/app/css'));
}

function buildVendorJS() {
  return gulp.src([ 'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.js',
                    'bower_components/angular-fileupload/angular-filereader.js',
                    'bower_components/angular-resource/angular-resource.js',
                    'bower_components/angular-route/angular-route.js',
                    'bower_components/angular-xeditable/dist/js/xeditable.js',
                    'bower_components/progressbar.js/dist/progressbar.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                    'bower_components/ng-droplet/dist/ng-droplet.js',
                    'bower_components/spin.js/spin.js',
                    'bower_components/angular-spinner/angular-spinner.js',
                    'bower_components/ng-sortable/dist/ng-sortable.min.js',
                    'bower_components/angular-animate/angular-animate.js'
                    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/app/js'));
}


function moveVendorFonts() {
  return gulp.src(['bower_components/bootstrap/dist/fonts/*']).pipe(gulp.dest('build/app/fonts'));
}

function buildVendorCSS() {
  return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css',
                    'bower_components/angular-xeditable/dist/css/xeditable.css',
                    'bower_components/angular-bootstrap/ui-bootstrap-csp.css',
                    'bower_components/ng-sortable/dist/ng-sortable.min.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('build/app/css'));
}

function clean() {
	return del([
    'build/build.json', // created by manage.py collectstatic
  ]); 
}


var buildVendor = gulp.series(buildVendorJS, buildVendorCSS, moveVendorFonts, moveVendorSrc);
var build = gulp.series(clean, moveHTML, buildJS, buildCSS, buildVendor); 


exports.build = build;
exports.clean = clean;
exports.default = build;
