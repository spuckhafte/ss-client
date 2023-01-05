# Simple Static Router


The Simple Static Router is a lightweight, easy-to-use HTTP server that serves static HTML pages. 
It comes with a built-in cache system and a simple way to include CSS and JavaScript files within your HTML pages.

## Features
1. Routing for multiple pages
2. Sub-routing for nested pages
3. Custom 404 page
4. Built-in cache for HTML pages
5. Support for adding styles and scripts to HTML pages
6. Support for embedding variables in HTML pages

## Usage
First, create an instance of the Router class by providing a port number and optional settings.<br>
The default settings are:
```js
{
  pagesDir: 'pages', // directory where HTML pages are stored
  stylesDir: 'styles', // directory where styles are stored
  scriptsDir: 'scripts', // directory where scripts are stored
  homePage: 'home', // name of the home page (page for the "/" route)
  errorPage: 'notFound', // name of the 404 page
  defaultStyle: 'style.css', // name of the default style
  defaultScript: 'script.js', // name of the default script
  htmlFt: '.html', // file type for HTML pages
  clearCache: 10 // seconds to clear the cache
}
```
For Example:
```js
const Router = require('ss-router')
const router = new Router(3000);
```
To start the server, call the start method of the Router instance:
```js
router.start();
```
To specify custom settings:
```js
const router = new Router(3000, {
  pagesDir: 'myPages',
  stylesDir: 'myStyles',
  scriptsDir: 'myScripts',
  homePage: 'index',
  errorPage: '404',
  defaultStyle: 'main.css',
  defaultScript: 'main.js',
  htmlFt: '.htm',
  clearCache: 30
});

// OR for editing specific settings:

const router = new Router(3000);
router.SETTINGS.HTML_FT = ".htm";
router.SETTINGS.CLEAR_CACHE_TIMING: 25 // seconds
```

## Caching
Caching
The router implements a simple cache that stores the processed HTML pages.<br>
The cache is cleared every `clearCache` seconds (as specified in the settings object passed to the constructor).<br>
You can disable caching by setting `clearCache` to `0`.

## File Management
In SS-Router, you will need to create a `pages` directory at the root of your project.<br>
Inside this directory, you should create a `.html` file for each page you want to be able to access on your server.
<br><br>
You can also create subroutes by including a `+` symbol in your file names.<br>
For example, if you want to create a route at `/about/team`, you would create a file called `about+team.html`.
<br><br>
In addition to the `pages` directory, you can also create a `styles` and `scripts` directory to store your CSS and JavaScript files, respectively.<br>
These will be automatically included in your HTML pages when you use the provided syntax.

## HTML Page Structure
To specify styles and scripts in an HTML page, use the following syntax:<br>
For styles:
```html
<style>
  /*[ "style.css", "error.css" ]*/
</style>

say you only want the default stylesheet ("style.css" : or whatever you specified in the settings)
<style>
  /* [] */
</style>
```
For scripts:
```html
<scripts>
  // [ "script.js", "error.js" ]
</scripts>

OR, for default script only ("script.js"):
<scripts>
  // []
</scripts>
```

### Embed variables
Define them in the `start` method:
```js
router.start({
  name: "SS-Client"
})
```

Refer to them as `variable.name`.<br>
For HTML:
```html
<body>
  <h1>README for <!--variable.name--> (all lowercase and no space in between)</h1>
<body>
```
For JS:
```js
function click() {
  alert("/*variable.name*/'s README"); // lowecase, no space
}
```
