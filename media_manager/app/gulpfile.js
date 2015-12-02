var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');

gulp.task('moveHTML', function(){
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('build'));
});

gulp.task('buildJS', function(){
  return gulp.src('src/js/app.js')
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('buildCSS', function(){
  return gulp.src('src/css/**/*.css')
    .pipe(concat('styles.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('build/css'));
})

gulp.task('buildVendorJS', function(){
  return gulp.src('bower_components/**/*.min.js')
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('buildVendorCSS', function(){
  return gulp.src(['bower_components/angular-bootstrap/ui-bootstrap-csp.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('buildVendor', ['buildVendorJS', 'buildVendorCSS']);

gulp.task('build', ['moveHTML', 'buildJS', 'buildCSS', 'buildVendor']);

gulp.task('connect', function(){
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('watch', function(){
  gulp.watch('src/js/**/*.js', ['buildJS']);
  gulp.watch('src/css/**/*.css', ['buildCSS']);
  gulp.watch('src/**/*.html', ['moveHTML']);
});

gulp.task('default', ['build', 'watch', 'connect']);
