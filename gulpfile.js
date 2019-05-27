const gulp         = require('gulp');
const fs           = require("graceful-fs");
const del          = require('del');
const runSequence  = require('run-sequence'); // Run a series of dependent gulp tasks in order
const plumber      = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
const notify       = require('gulp-notify'); // notification plugin for gulp
const babel        = require('gulp-babel'); // use last version of javascript
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
  gulp.watch('src/sass/**/*.{sass,scss}', ['watch-sass']);
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

// copy libs
gulp.task('copy-js', () => {
  return gulp
    .src('src/libs/*.{js,js.map}')
    .pipe(gulp.dest('dist/js'));
});
gulp.task('copy-css', () => {
  return gulp
    .src('src/libs/*.{css,css.map}')
    .pipe(gulp.dest('dist/css'));
});
gulp.task('copy-fonts', () => {
  return gulp
    .src('src/fonts/**.*')
    .pipe(gulp.dest('dist/fonts'));
});

// Check JS for errors
gulp.task('lint-js', () => {
  return gulp
    .src(['src/js/**/*.js', '!src/js/libs/**'])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

// Minify JS
gulp.task('javascript', gulp.series('lint-js', () => {
  return gulp
    .src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concatJS('scripts.min.js'))
    .pipe(minifyJS({
      // options: https://github.com/mishoo/UglifyJS2#minify-options
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
}));



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
gulp.task('sass', gulp.series('images', () => {
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
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css/'));
}));

// cachebust
gulp.task('cachebust', () => {
  return gulp
    .src('./dist/*.html')
    .pipe(cachebust())
    .pipe(gulp.dest('./dist'));
});

const delInPormise = (path) => new Promise((resolve, reject) => {
  del(path, (err) => {
    if (err) return reject(err);
    return resolve();
  });
});

const mkdirInPromise = (path, options) => new Promise((resolve, reject) => {
  fs.mkdir(path, options, err => {
    if (err) return reject(err);
    return resolve();
  });
});

gulp.task('directories', function () {
  return gulp.src('*.*', {read: false})
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./js'))
    .pipe(gulp.dest('./img/content'))
    .pipe(gulp.dest('./img/icons'))
    .pipe(gulp.dest('./fonts'));
});

// clear all in dist folder
gulp.task('reset', gulp.series(
  del([ 'dist/*' ]),
  directories,
));

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
gulp.task('watch-html', gulp.series(
  'html',
  (done) => {
    browser.reload();
    done();
  },
));

gulp.task('watch-sass', gulp.series(
  'sass',
  'cachebust',
  (done) => {
    browser.reload();
    done();
  },
));

gulp.task('watch-img', gulp.series(
  'images',
  (done) => {
    browser.reload();
    done();
  },
));

gulp.task('watch-js', gulp.series(
  'javascript',
  (done) => {
    browser.reload();
    done();
  },
));

// --------------------------
// >>> DEFAULT
const defaultTasks = gulp.series(
  'reset',
  'html',
  'copy-js',
  'copy-css',
  'copy-fonts',
  // 'sprites',
  gulp.parallel(
    'sass',
    'javascript'
  ),
  'server',
);
gulp.task('default', defaultTasks());
// gulp.task('default', (cb) => {
//   runSequence(
//     'reset',
//     'html',
//     'copy-js',
//     'copy-css',
//     'copy-fonts',
//     // 'sprites',
//     [
//       'sass',
//       'javascript'
//     ],
//     'server',
//     cb);
// });

// --------------------------
// >>> Error handler
function onError(error) {
  notify.onError({
    title: 'Gulp error in the <%= error.plugin %> plugin',
    message: '<%= error.message %>'
  })(error);
  this.emit('end');
};
