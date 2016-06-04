var gulp = require('gulp');
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var del = require('del');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var git = require('gulp-git');
var exec = require('child_process').exec;
var fs = require('fs');
//var Server = require('karma').Server;
//var jshint = require('gulp-jshint');

gulp.task('moveHTML', function(){
  gulp.src('src/index.html')
    .pipe(gulp.dest('.'));
  return gulp.src(['src/**/*.html'])
    .pipe(gulp.dest('build/app'));
});

gulp.task('moveVendorSrc', ['initMirador'], function(){
  return gulp.src('src/vendor/**/*')
    .pipe(sort())
    .pipe(gulp.dest('build/app/vendor'));
});

gulp.task('buildJS', function(){
  return gulp.src('src/js/**/*.js')
    .pipe(sort())
    .pipe(concat('app.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('build/app/js'));
});

gulp.task('buildCSS', function(){
  return gulp.src('src/css/**/*.css')
    .pipe(sort())
    .pipe(concat('styles.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('build/app/css'));
});

gulp.task('buildVendorJS', function(){
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
});

gulp.task('buildVendorCSS', function(){
  return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css',
                    'bower_components/angular-xeditable/dist/css/xeditable.css',
                    'bower_components/angular-bootstrap/ui-bootstrap-csp.css',
                    'bower_components/ng-sortable/dist/ng-sortable.min.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('build/app/css'));
});

gulp.task('moveVendorFonts', function(){
  return gulp.src(['bower_components/bootstrap/dist/fonts/*'])
  .pipe(gulp.dest('build/app/fonts'));
});

gulp.task('buildVendor', ['buildVendorJS', 'buildVendorCSS', 'moveVendorFonts', 'moveVendorSrc']);

gulp.task('clean', function() {
  return del(['build/build.json']) // created by "manage.py collectstatic"
});

//gulp.task('build', ['clean', 'moveHTML', 'buildJS', 'buildCSS', 'buildVendor', 'initMirador']);
gulp.task('build', ['clean', 'moveHTML', 'buildJS', 'buildCSS', 'buildVendor', 'initMirador']);

gulp.task('connect', function(){
  connect.server({
    root: 'build',
    livereload: true
  });
});

var miradorDir = 'src/vendor/mirador';
gulp.task('cloneMirador', function(cb){

  if(!fs.existsSync(miradorDir)){
    git.clone('https://github.com/IIIF/Mirador', {args: miradorDir}, function(err) {
      if(err){
        throw err;
      }
      cb(err);
    });
  } else {
    cb();
  }
});

var buildMirador = function(cb){
  console.log("Building Mirador");

  exec('npm install', {cwd: miradorDir}, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if(err){
      cb(err);
    }
    exec('grunt', {cwd: miradorDir}, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
};
// this one has the clone as a dependency
gulp.task('initMirador', ['cloneMirador'], buildMirador);
// this one is for the watch
gulp.task('buildMirador', buildMirador);

gulp.task('watch', function(){
  gulp.watch('src/js/**/*.js', ['buildJS']);
  gulp.watch('src/css/**/*.css', ['buildCSS']);
  gulp.watch('src/**/*.html', ['moveHTML']);
  gulp.watch('bower_components/**/*.js', ['buildVendor']);
});

gulp.task('default', ['build', 'watch', 'connect']);
gulp.task('dev', ['build', 'watch']);
