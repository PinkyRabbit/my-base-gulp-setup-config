const gulp         = require('gulp');
const del          = require('del'); // to remove old files
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

const IS_PRODUCTION_VERSION = process.env.NODE_ENV === 'production';

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
  gulp.watch('src/*.html', gulp.series('watch-html'));
  gulp.watch('src/sass/**/*.{sass,scss}', gulp.series('watch-sass'));
  gulp.watch('src/js/**/*.js', gulp.series('watch-js'));
  gulp.watch(['src/images/**/*.{png,jpg,gif,svg}', '!src/images/sprites/**'], gulp.series('watch-img'));
  // gulp.watch('src/images/sprites/**', gulp.series('sprites'));
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
const cleanOps = IS_PRODUCTION_VERSION
  ? { level: 2 }
  : { format: 'beautify' }
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
    .pipe(cleanCSS(cleanOps))
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


// clear all in dist folder
gulp.task('deleteAll', () => del([ 'dist' ]));
gulp.task('createFolders', function () {
  return gulp.src('*.*', {read: false})
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(gulp.dest('./dist/images/content'))
    .pipe(gulp.dest('./dist/images/icons'))
    .pipe(gulp.dest('./dist/fonts'));
});
gulp.task('reset', gulp.series(
  'deleteAll',
  'createFolders',
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
const reload = (done) => {
  browser.reload();
  done();
};

// >>> task + reload
gulp.task('watch-html', gulp.series(
  'html',
  reload,
));

const devSass = gulp.series(
  'sass',
  'cachebust',
  reload,
);

const prodSass = gulp.series(
  'sass',
  'cachebust',
  reload,
);

gulp.task('watch-sass', IS_PRODUCTION_VERSION ? prodSass : devSass);

gulp.task('watch-img', gulp.series(
  'images',
  reload,
));

gulp.task('watch-js', gulp.series(
  'javascript',
  reload,
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
gulp.task('default', defaultTasks);

// --------------------------
// >>> Error handler
function onError(error) {
  notify.onError({
    title: 'Gulp error in the <%= error.plugin %> plugin',
    message: '<%= error.message %>'
  })(error);
  this.emit('end');
}
