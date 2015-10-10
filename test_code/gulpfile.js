var gulp = require('gulp');
var connect = require('gulp-connect');
var runSequence = require('run-sequence');

gulp.task('connect', function () {
  connect.server({
    livereload: true
  });
});

gulp.task('loadfiles', function () {
  return gulp.src(['*.html', 'js/*.js', 'css/*.css'])
    .pipe(connect.reload());
});

gulp.task('loader', function (cb) {
  runSequence(
    'loadfiles',
    'connect',
    cb
  );
});
