# Gulp templating
> My setup to developing with `gulp`.

You can move from here but I strongly recommend you install all from CLI to get last versions of all packages.
```
npm install --save-dev browser-sync gulp gulp-autoprefixer gulp-cache-bust gulp-clean gulp-clean-css gulp-concat gulp-imagemin gulp-jshint gulp-notify gulp-plumber gulp-rename gulp-sass gulp-uglify imagemin-pngquant jshint jshint-stylish run-sequence
```
All in `gulpfile.js`. 

`Src` structure:
```
index.html
*.html          // any html
/images         // folder with images
/images/sprites // if you need sprites
/js             // javascript folder
/js/lib         // any javascript libs (only will copied)
/sass           // folder for sass
```
In `index.html`:
* styles save as `styles.min.css`
* scripts save as `scripts.min.js`
 
Easy as cake. Happy coding!
