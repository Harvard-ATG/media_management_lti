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
  return gulp.src(['src/templates/**/*.html'])
    .pipe(gulp.dest('build/app/templates'));
});

gulp.task('moveVendorSrc', function(){
  return gulp.src(['src/vendor/**/*'])
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




var tmpDir = 'tmp';
var miradorDir = tmpDir + '/mirador';
var miradorBuildDir = miradorDir + '/build/mirador';
gulp.task('cloneMirador', function(done){
  if(!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
  }
  if(!fs.existsSync(miradorDir)){
    git.clone('https://github.com/IIIF/Mirador', {args: miradorDir}, function(err) {
      if(err){
        throw err;
      }
      done(err);
    });
  } else {
    done();
  }
});
gulp.task('buildMirador', ['cloneMirador'], function(done){
  exec('npm install', {cwd: miradorDir}, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if(err){
      done(err);
    }
    exec('./node_modules/grunt-cli/bin/grunt', {cwd: miradorDir}, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      done(err);
    });
  });
});
gulp.task('moveMirador', ['buildMirador'], function(){
  gulp.src([miradorBuildDir + '/**/*'])
  .pipe(gulp.dest('src/vendor/mirador'));
});

gulp.task('cleanMirador', function(){
  del([miradorDir, 'build/app/vendor/mirador', 'src/vendor/mirador']);
});

gulp.task('mirador', ['cloneMirador', 'buildMirador', 'moveMirador']);





gulp.task('clean', function(done) {
  del(['build/build.json']).then(function(){
    done();
  }); // created by "manage.py collectstatic"
});


gulp.task('build', ['clean', 'moveHTML', 'buildJS', 'buildCSS', 'buildVendor']);

gulp.task('connect', function(){
  connect.server({
    root: 'build',
    livereload: true
  });

});

gulp.task('watch', function(){
  gulp.watch('src/js/**/*.js', ['buildJS']);
  gulp.watch('src/css/**/*.css', ['buildCSS']);
  gulp.watch('src/templates/**/*.html', ['moveHTML']);
  gulp.watch('bower_components/**/*.js', ['buildVendor']);
  //gulp.watch('src/vendor/**/*', ['moveVendorSrc']);
});

gulp.task('default', ['build', 'watch', 'connect']);
gulp.task('dev', ['build', 'watch']);
