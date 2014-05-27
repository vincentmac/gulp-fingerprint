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
	return gulp.src('.tmp/styles/app.css')
		.pipe(fingerprint(manifest))
		.pipe(gulp.dest('dist'));
});
```


## API

### fingerprint(manifest, [options])

#### manifest

Type: `object`

Example: `rev-manifest.json` produced from using [gulp-rev](https://www.npmjs.org/package/gulp-rev)
```json
{
  "images/logo.jpg": "images/logo-2d4a1176.jpg",
  "images/some-image.png": "images/some-image-abd84705.png"
}
```

#### options

##### type

Type: `string`
Default: `css`

```js
css
/url\("(.*)"\)/g
```

##### regex
Type: [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)

Sets a custom regex to match on your file.


## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Mac](http://simplicity.io)
