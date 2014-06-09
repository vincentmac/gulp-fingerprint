'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var split = require('split2');
var chalk = require('chalk');

var PLUGIN_NAME = 'gulp-fingerprint';

/**
 * Gulp Plugin to stream through a file and rename regex matches
 *
 * @param {Object} manifest - rev-manifest
 * @param {Object} options
 */
var plugin = function(manifest, options) {
  var css = /url\("(.*)"\)/g;
  var regex = css; // set default regex to css
  options = options || {};
  var content = [];

  // Set Regex type
  if (options.type) {
    if (options.type === 'css') regex = css;
    // ... add additional predefined RegExp types here
  }

  // Use custom RegExp
  if (options.regex) regex = options.regex;

  function urlReplace(buf, enc, cb) {
    var line = buf.toString();
    var replace;
    var match = regex.exec(line);

    if (match) {
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(match[1].replace(/^\//, '')));
      replace = manifest[match[1]] || manifest[match[1].replace(/^\//, '')] || manifest[match[1].split('?')[0]];
      if (replace) line = line.replace(match[1], replace);
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(line));
    }

    content.push(line);
    cb();
  }

  var stream = through.obj(function(file, enc, cb) {
    var that = this;
    content = []; // reset file content

    if (file.isNull()) {
      this.push(file);
      return cb();
    }
    // console.log(file.contents);

    if (file.isStream()) {
      // console.log('is Stream');
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return cb();
    }

    if (file.isBuffer()) {
      // console.log('is Buffer');
      file.pipe(split())
      .pipe(through(urlReplace,  function(callback) {
        if (content.length) {
          file.contents = new Buffer(content.join('\n'));
          that.push(file);
        }
        // callback();
        cb();
      }));
    }

  });

  return stream;
};

module.exports = plugin;
