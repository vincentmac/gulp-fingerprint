# [gulp](http://gulpjs.com)-fingerprint [![Build Status](https://travis-ci.org/vincentmac/gulp-fingerprint.svg?branch=master)](https://travis-ci.org/vincentmac/gulp-fingerprint)

## Install

```bash
$ npm install --save-dev gulp-fingerprint
```


## Usage

Update a source file with fingerprinted assets.

```js
var gulp = require('gulp');
var fingerprint = require('gulp-fingerprint');

// rev-manifest.json produced from gulp-rev
var manifest = require('../../dist/rev-manifest');

gulp.task('default', function () {
  var options = {
    base: 'assets/',
    prefix: '//cdn.example.com/',
    verbose: true
  };

  return gulp.src('.tmp/styles/app.css')
    .pipe(fingerprint(manifest, options))
    .pipe(gulp.dest('dist'));
  });
```


## API

### fingerprint(manifest, [options])

#### manifest

_Type_: `object, string`

_Example_: `rev-manifest.json` produced from using [gulp-rev](https://www.npmjs.org/package/gulp-rev)
```json
{
  "images/logo.jpg": "images/logo-2d4a1176.jpg",
  "images/some-image.png": "images/some-image-abd84705.png",
  "images/some-logo2.png": "images/some-logo2-abd84715.png"
}
```

If it's a string, it will be interpretered as path to json file.

#### options

##### mode
_Type_: `string`

_Default_: `regex`

_Usage_: Setting a `prefix` will change the method of url replacing. There are two methods: `regex` and `replace`. Second method is less accurate but doesn't require to specify complicated regular expression.

##### regex
_Type_: [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

_Usage_: Sets a custom regex to match on your file.

_ **Note** The default regex, `/(?:url\(["']?(.*?)['"]?\)|src=["'](.*?)['"]|src=([^\s\>]+)(?:\>|\s)|href=["'](.*?)['"]|href=([^\s\>]+)(?:\>|\s))/g`, will match:

- `url('path/to/resource')`
- `url("path/to/resource")`
- `url(path/to/resource)`
- `href='path/to/resource'`
- `href="path/to/resource"`
- `href=path/to/resource`
- `src='path/to/resource'`
- `src="path/to/resource"`
- `src=path/to/resource`

##### prefix
_Type_: `string`

_Usage_: Setting a `prefix` will prepend the string to a match in the src
```js
...
.pipe(fingerprint(manifest, {prefix: '//cdn.example.com/'}))
...
// Original: `background-image: url("/images/some-logo.png");`
// Replaced: `background-image: url("//cdn.example.com/images/logo-2d4a1176.jpg");` in src file
```

##### base
_Type_: `string`

_Usage_: Setting a `base` will remove that string from the beginning of a match in the src
```js
...
.pipe(fingerprint(manifest, {base: 'assets/'}))
...

// Original: `background-image: url("assets/images/some-logo2.png");`
// Replaced: `background-image: url("images/some-logo2-abd84715.png");` in src file
```

##### strip
_Type_: `string`

_Usage_: Setting a `strip` will remove that string from the beginning of a result path
```js
...
.pipe(fingerprint(manifest, {strip: 'images/'}))
...

// Original: `background-image: url("/images/some-logo2.png");`
// Replaced: `background-image: url("some-logo2-abd84715.png");` in src file
```

##### verbose
_Type_: `boolean`

_Usage_: Outputs to stdout.

```bash

[gulp] gulp-fingerprint Found: images/some-logo.png
[gulp] gulp-fingerprint Replaced:   background-image: url("//cdn.example.com/images/logo-2d4a1176.jpg"); }
```

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Mac](http://simplicity.io)
