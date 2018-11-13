# Gulp templating
> My setup to developing with `gulp`.

This is my base gulp setup for website templating. I added [Bulma](https://bulma.io/) like an example of SASS usage (cuz its a most used by me css framework) and [toastr](https://github.com/CodeSeven/toastr) as an example of the external library that not needed to minify (I use it in most of my projects). Njoy!

Main pros of usage: `Javascript` last version with `babel`, `sass` syntax accepted, _minification_ and _mapping_ of `css` and `js`, image _minification_, `js` _validation_. Just clone and make `npm install`

`Src` structure:
```
index.html
*.html          // any html
/images         // folder with images
/images/sprites // if you need sprites
/js             // your javascripts files place in here
/sass           // folder for sass
/libs           // all libs here please (jquery and so on you place here)
```
In `index.html`:
* styles save as `styles.min.css`
* scripts save as `scripts.min.js`

Easy as cake. Happy coding!
