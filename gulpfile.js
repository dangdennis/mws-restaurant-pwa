var gulp = require('gulp');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var del = require('del');
var babel = require('gulp-babel');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('html', function() {
    return gulp
        .src('*.html')
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                removeComments: true
            })
        )
        .pipe(gulp.dest('build/'));
});

gulp.task('clean', () => del(['build']));

gulp.task('css', function() {
    return gulp
        .src('css/*.css')
        .pipe(autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css'));
});

gulp.task('js', function() {
    return (
        gulp
            .src('js/*.js')
            .pipe(babel())
            // .pipe(uglify())
            .pipe(concat('app.min.js'))
            .pipe(gulp.dest('build/js'))
    );
});

gulp.task('sw', function() {
    return (
        gulp
            .src('sw.js')
            // .pipe(sourcemaps.init())
            // .pipe(concat('sw.min.js'))
            // .pipe(sourcemaps.write())
            .pipe(gulp.dest('build/'))
    );
});

gulp.task('default', ['clean'], function() {
    runSequence('html', 'css', 'js', 'sw');
});
