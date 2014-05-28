/* globals it*/
'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var fingerprint = require('../');
var manifest = require('./rev-manifest');

var fakeFile = 'body {\n' +
  '  background-image: url("/images/body-bg.jpg");\n' +
  '  background-attachment: fixed; }\n' +

  '.logo {\n' +
  '  background-image: url("/images/some-logo.png");\n' +
  '}';

it('should update multiple assets in one file', function (done) {
  var stream = fingerprint(manifest);

  stream.on('data', function (file) {
    var updatedCSS = file.contents.toString();
    var regex1 = /images\/body-bg-2d4a1176.jpg/;
    var regex2 = /images\/some-logo-abd84705.png/;
    var match1 = regex1.exec(updatedCSS);
    var match2 = regex2.exec(updatedCSS);

    assert.equal(match1[0], 'images/body-bg-2d4a1176.jpg');
    assert.equal(match2[0], 'images/some-logo-abd84705.png');
    done();
  });

  stream.write(new gutil.File({
    path: 'app.css',
    contents: new Buffer(fakeFile)
  }));

});
