# Gulp templating
> My setup to developing with `gulp`.

This is my base gulp setup for website templating. I added [Bulma](https://bulma.io/) for the example of SASS usage (cuz it's mostly used by me css framework) and [toastr](https://github.com/CodeSeven/toastr) for the example of the external library that doesn't need to be minifed (I use it in most of my projects) and [JQuery](https://jquery.com/) for it. Also there is a `cachebust` and [Font Awesome](https://fontawesome.com/) icons. Njoy!

Main pros of usage: `Javascript` last version with `babel`, `sass` syntax accepted, _minification_ and _mapping_ of `css` and `js`, image _minification_, `js` _validation_. Just clone and make `npm install`

`Src` structure:
```
index.html
*.html          // any html
/images         // folder with images
/images/sprites // if you need sprites
/js             // your javascripts files place in here
/sass           // folder for sass
/fonts          // folder with fonts
/libs           // all libs here please (jquery and so on you may place here)
```
> application works on http://localhost:3210/

In `index.html`:
* styles save as `styles.min.css`
* scripts save as `scripts.min.js`

Easy as a cake. Happy coding!
