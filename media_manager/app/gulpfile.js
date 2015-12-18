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
  return gulp.src('src/js/**/*.js')
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
  return gulp.src(['bower_components/angular/angular.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.min.js',
                    'bower_components/angular-fileupload/angular-filereader.min.js',
                    'bower_components/angular-resource/angular-resource.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'bower_components/progressbar.js/dist/progressbar.min.js',
                    'bower_components/ng-droplet/dist/ng-droplet.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('buildVendorCSS', function(){
  return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'bower_components/angular-bootstrap/ui-bootstrap-csp.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('moveVendorFonts', function(){
  return gulp.src(['bower_components/bootstrap/dist/fonts/*'])
  .pipe(gulp.dest('build/fonts'));
});

gulp.task('buildVendor', ['buildVendorJS', 'buildVendorCSS', 'moveVendorFonts']);

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
  gulp.watch('bower_components/**/*.js', ['buildVendor']);
});

gulp.task('default', ['build', 'watch', 'connect']);
