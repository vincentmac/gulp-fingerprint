/* globals it*/
'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var fingerprint = require('../');
var manifest = require('./rev-qs-manifest');
var fakeFile = '<html>'
+ '<head>\n'
+ '<title>Some Web Site</title>\n'
+ '<link rel="shortcut icon" type="image/x-icon" href="images/favicon.ico#v=74180833826528598c89f0d4949473a7">\n'
+ '    <script src="js/site.js?v=c625c1e4b5dd80acb73126287946fd5b"></script>\n'
+ '   <script src="js/other.js"></script>\n'
+ '  </head>\n'
+ '  <body>\n'
+ '  </body>\n'
+ '</html>';

['regex', 'replace'].forEach(function(mode) {

  describe('in `' + mode + '` mode', function () {

    it('should replace query string based fingerprints', function (done) {
      var stream = fingerprint(manifest, {regex: /(?:href=|src=)"([^\"]*)"/});

      stream.on('data', function (file) {
        var updatedHTML = file.contents.toString();
        // console.log(updatedHTML);
        var regex1 = /images\/favicon-99999\.ico/;
        var regex2 = /js\/site\.js\?v=10923/;
        var regex3 = /js\/other\.js\?v=190283091/;
        var match1 = regex1.exec(updatedHTML);
        var match2 = regex2.exec(updatedHTML);
        var match3 = regex3.exec(updatedHTML);

        assert.equal(match1[0], 'images/favicon-99999.ico');
        assert.equal(match2[0], 'js/site.js?v=10923');
        assert.equal(match3[0], 'js/other.js?v=190283091');
        done();
      });

      stream.write(new gutil.File({
        path: 'app.html',
        contents: new Buffer(fakeFile)
      }));

    });

  });

});
