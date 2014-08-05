var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('dist', function () {
    gulp.src('objar.js')
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.extname = '.min.js'
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['dist']);
