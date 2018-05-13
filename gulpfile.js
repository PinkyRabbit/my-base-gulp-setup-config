const gulp         = require('gulp');
const runSequence  = require('run-sequence'); // Run a series of dependent gulp tasks in order
const path         = require('path'); // NodeJS
const plumber      = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
const notify       = require('gulp-notify'); // notification plugin for gulp
const minifyJS     = require('gulp-uglify'); // Minify javascript
const concatJS     = require('gulp-concat'); // concat all javascripts in one file
const jshint       = require('gulp-jshint'); // JShint for gulp
const stylish      = require('jshint-stylish');// Stylish reporter for JSHint
const imagemin     = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images
const pngquant     = require('imagemin-pngquant'); // pngquant imagemin plugin
const sass         = require('gulp-sass'); // compiling SASS files
const autoprefixer = require('gulp-autoprefixer'); // Prefix CSS
const cleanCSS     = require('gulp-clean-css'); // Minify CSS
const sourcemaps   = require('gulp-sourcemaps'); // sourcemaps generator
const cachebust    = require('gulp-cache-bust'); // cachebust plugin for gulp

const rename       = require('gulp-rename'); // rename files
const clean        = require('gulp-clean'); // clean directory

// --------------------------
// >>> SERVER
const browser = require('browser-sync').create();
const PORT = 3210;

gulp.task('server', () => {
  browser.init({
    // Options: https://www.browsersync.io/docs/options
    logLevel: 'debug',
    server: { baseDir: 'dist' },
    port: PORT,
  });

  // Watch for file changes.
  gulp.watch('src/*.html', ['watch-html']);
  gulp.watch('src/sass/**/*.scss', ['watch-sass']);
  gulp.watch('src/js/**/*.js', ['watch-js']);
  gulp.watch(['src/images/**/*.{png,jpg,gif,svg}', '!src/images/sprites/**'], ['watch-img']);
  // gulp.watch('src/images/sprites/**', ['sprites']);
});

// --------------------------
// >>> TASKS

// copy html
gulp.task('html', () => {
  return gulp
    .src('src/*.html')
    .pipe(gulp.dest('dist'));
});

// copy JS libs
gulp.task('copy-libs', () => {
  return gulp
    .src('src/js/lib/*.js')
    .pipe(gulp.dest('dist/js'));
});

// Minify JS
gulp.task('javascript', ['lint-js'], () => {
  return gulp
    .src('src/js/*.js')
    .pipe(minifyJS({
      // options: https://github.com/mishoo/UglifyJS2#minify-options
    }))
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('dist/js'));
});

// Check JS for errors
gulp.task('lint-js', () => {
  return gulp
    .src(['src/js/**/*.js', '!src/js/lib/**'])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

// Optimize images
gulp.task('images', () => {
  return gulp
    .src(['src/images/**/*.{png,jpg,gif,svg}', '!src/images/sprites/**'])
    .pipe(imagemin({
        verbose: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});

// compile SASS
gulp.task('sass', ['images'], () => {
  return gulp
    .src('src/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({
      // options: https://github.com/sass/node-sass#options
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
      // browsers: ['last 2 versions', 'ie 6-8']
        browsers: ['last 10 versions'],
        cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(rename('styles.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css/'));
});

// cachebust
gulp.task('cachebust', () => {
  return gulp
    .src('./dist/*.html')
    .pipe(cachebust())
    .pipe(gulp.dest('./dist'));
});

// clear all in dist folder
gulp.task('reset', () => {
  return gulp
      .src('dist')
      .pipe(clean());
});

// Creates sprites from SVG files.
// gulp.task('sprites', () => {
//   return gulp
//     .src('src/images/sprites/**/*.svg')
//     .pipe(svgSprites({
//       cssFile: 'scss/_sprites.scss',
//       templates: {
//         scss: true,
//       },
//       preview: false,
//       svg: {
//         sprite: 'images/sprite.svg',
//       }
//     }))
//     .pipe(gulp.dest('src'));
// });

// --------------------------
// >>> task + reload
gulp.task('watch-html', ['html'], (done) => {
  browser.reload();
  done();
});

gulp.task('watch-sass', ['sass', 'cachebust'], (done) => {
  browser.reload();
  done();
});

gulp.task('watch-img', ['images'], (done) => {
  browser.reload();
  done();
});

gulp.task('watch-js', ['javascript'], (done) => {
  browser.reload();
  done();
});

// --------------------------
// >>> DEFAULT
gulp.task('default', (cb) => {
  runSequence(
    'reset',
    'html',
    'copy-libs',
    // 'sprites',
    [
      'sass',
      'javascript'
    ],
    'server',
    cb);
});

// --------------------------
// >>> Error handler
function onError(error) {
  notify.onError({
    title: 'Gulp error in the <%= error.plugin %> plugin',
    message: '<%= error.message %>'
  })(error);
  this.emit('end');
};