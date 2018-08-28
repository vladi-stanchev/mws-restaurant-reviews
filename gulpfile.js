/* eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine-phantom');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
//const cleanCSS = require('gulp-clean-css');

gulp.task('default', gulp.series(['copy-html', 'copy-images', 'styles', 'lint'], function () {
    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('js/**/*.js', ['lint']);
    gulp.watch('/index.html', ['copy-html']);
    gulp.watch('./dist/index.html').on('change', browserSync.reload);
    
    browserSync.init({
        server: "./dist"
    });
    //browserSync.stream();
}));

gulp.task('dist', [
    'copy-html',
    'copy-images',
    'styles',
    'lint',
    'scripts-dist'
]);

// gulp.task('minify-css', () => {
//   return gulp.src('css/*.css')
//     .pipe(cleanCSS({compatibility: 'ie8'}))
//     .pipe(gulp.dest('dist/css'));
// });

gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
    gulp.src('js/**/*.js')
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
  gulp.src(['./index.html', 'restaurant.html'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
      .pipe(gulp.dest('dist/img'));
  });

// Takes files from SASS folder and generates them in dist/css
gulp.task('styles', function() {
  gulp.src('sass/*.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});


gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "yourlocal.dev"
    });
});