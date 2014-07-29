/* globals it*/
'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var fingerprint = require('../');
var manifest = require('./rev-manifest');

var fakeCssFile = 'body {\n' +
  '  background-image: url("/images/body-bg.jpg");' +
  '  background-image: url("/images/body-bg.jpg");\n' +
  '  background-attachment: fixed;\n' +
  '}\n' +
  '.logo {\n' +
  '  background-image: url(/images/some-logo.png);\n' +
  '}\n' +
  '.logo2 {\n' +
  '  background-image: url(\'assets/images/some-logo2.png\');\n' +
  '  background-image: url(\'assets/images/some-logo2.png\');\n' +
  '  background-image: url("/images/some-logo2.png");\n' +
  '  background-image: url("/images/some-logo2.png");\n' +
  '}'
  ;
var fakeHtmlFile = '<body>\n' +
  '  <img src="/images/body-bg.jpg" alt="" />\n' +
  '  <a href="/images/some-logo.png"></a>\n' +
  '  <a href=\'/images/body-bg.jpg\'></a>\n' +
  '  <img src=\'/images/some-logo.png\' alt="" />\n' +
  '  <a href=/images/some-logo.png></a>\n' +
  '  <img src=/images/body-bg.jpg alt="" />\n' +
  '</body>';

['regex', 'replace'].forEach(function(mode) {

  describe('in `' + mode + '` mode', function() {

    it('should update multiple assets in one file', function (done) {
      var stream = fingerprint(manifest, { mode: mode });

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /images\/body-bg-2d4a1176.jpg/g;
        var regex2 = /images\/some-logo-abd84705.png/;
        var match1 = regex1.exec(updatedCSS);
        var match2 = regex2.exec(updatedCSS);

        assert.equal(match1[0], 'images/body-bg-2d4a1176.jpg');
        assert.equal(match2[0], 'images/some-logo-abd84705.png');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));

    });

    it('should prepend assets in one file', function (done) {
      var stream = fingerprint(manifest, {prefix: 'https://cdn.example.com/'});

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /https\:\/\/cdn.example.com\/images\/body-bg-2d4a1176.jpg/;
        var regex2 = /https\:\/\/cdn.example.com\/images\/some-logo-abd84705.png/;
        var match1 = regex1.exec(updatedCSS);
        var match2 = regex2.exec(updatedCSS);

        assert.equal(match1[0], 'https://cdn.example.com/images/body-bg-2d4a1176.jpg');
        assert.equal(match2[0], 'https://cdn.example.com/images/some-logo-abd84705.png');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));

    });

    it('should match assets with an optional base', function (done) {
      var stream = fingerprint(manifest, {base: 'assets/'});

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /images\/body-bg-2d4a1176.jpg/;
        var regex2 = /images\/some-logo-abd84705.png/;
        var regex3 = /images\/some-logo2-abd84715.png/;
        var match1 = regex1.exec(updatedCSS);
        var match2 = regex2.exec(updatedCSS);
        var match3 = regex3.exec(updatedCSS);

        assert.equal(match1[0], 'images/body-bg-2d4a1176.jpg');
        assert.equal(match2[0], 'images/some-logo-abd84705.png');
        assert.equal(match3[0], 'images/some-logo2-abd84715.png');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));

    });


    it('should match assets with an optional base and prepend text', function (done) {
      var stream = fingerprint(manifest, {
        base: 'assets\\/',
        prefix: 'https://cdn.example.com/'
      });

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /https\:\/\/cdn.example.com\/images\/body-bg-2d4a1176.jpg/;
        var regex2 = /https\:\/\/cdn.example.com\/images\/some-logo-abd84705.png/;
        var regex3 = /https\:\/\/cdn.example.com\/images\/some-logo2-abd84715.png/;
        var match1 = regex1.exec(updatedCSS);
        var match2 = regex2.exec(updatedCSS);
        var match3 = regex3.exec(updatedCSS);

        assert.equal(match1[0], 'https://cdn.example.com/images/body-bg-2d4a1176.jpg');
        assert.equal(match2[0], 'https://cdn.example.com/images/some-logo-abd84705.png');
        assert.equal(match3[0], 'https://cdn.example.com/images/some-logo2-abd84715.png');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));

    });

    it('should match several assets in one line', function(done) {
      var stream = fingerprint(manifest, { mode: mode });

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex = /images\/body-bg-2d4a1176.jpg/g;

        assert.equal(updatedCSS.match(regex).length, 2);
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));
    });

    it('should match assets in html', function(done) {
      var stream = fingerprint(manifest, { mode: mode });

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /images\/body-bg-2d4a1176.jpg/g;
        var regex2 = /images\/some-logo-abd84705.png/g;
        var match1 = regex1.exec(updatedCSS);
        var match2 = regex2.exec(updatedCSS);

        assert.equal(match1[0], 'images/body-bg-2d4a1176.jpg');
        assert.equal(match2[0], 'images/some-logo-abd84705.png');
        assert.equal(updatedCSS.match(regex1).length, 3);
        assert.equal(updatedCSS.match(regex2).length, 3);
        done();
      });

      stream.write(new gutil.File({
        path: 'app.html',
        contents: new Buffer(fakeHtmlFile)
      }));
    });

    it('should strip asset path', function (done) {
      var stream = fingerprint(manifest, {
        strip: '/images/'
      });

      stream.on('data', function (file) {
        var updatedCSS = file.contents.toString();
        var regex1 = /"body-bg-2d4a1176.jpg"/g;
        var match1 = regex1.exec(updatedCSS);

        assert.equal(match1[0], '"body-bg-2d4a1176.jpg"');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.css',
        contents: new Buffer(fakeCssFile)
      }));

    });

  });

});