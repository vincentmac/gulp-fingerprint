'use strict';

var chalk = require('chalk');
var gutil = require('gulp-util');
// var path = require('path');
var split = require('split2');
var through = require('through2');

var PLUGIN_NAME = 'gulp-fingerprint';

/**
 * Gulp Plugin to stream through a file and rename regex matches
 *
 * @param {Object} manifest - rev-manifest
 * @param {Object} options
 */
var plugin = function(manifest, options) {
  options = options || {};

  // Default regex to allow for single and double quotes
  // var regex = new RegExp('url\\("(.*)"\\)|src="(.*)"|href="(.*)"|url\\(\'(.*)\'\\)|src=\'(.*)\'|href=\'(.*)\'', 'g');
  var regex = /(?:url\(["']?(.*?)['"]?\)|src=["'](.*?)['"]|src=([^\s\>]+)(?:\>|\s)|href=["'](.*?)['"]|href=([^\s\>]+)(?:\>|\s))/g;
  var prefix = '';
  var base;
  var strip = '';
  var content = [];

  // Use custom RegExp
  if (options.regex) regex = options.regex;

  if (options.prefix) prefix = options.prefix;

  if (options.base) base = new RegExp('^\/' + options.base + '|^' + options.base);

  if (options.strip) strip = options.strip;

  function removeBase(str, base) {
    return str && str.slice(0, base.length).replace(base, '') + str.slice(base.length);
  }

  function urlReplace(buf, enc, cb) {
    var line = buf.toString();

    line = line.replace(regex, function(str, i) {
      var url = Array.prototype.slice.call(arguments, 1).filter(function(a) {return a;})[0];
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(m.replace(/^\//, '')));
      var replaced = manifest[url] || manifest[url.replace(/^\//, '')] || manifest[url.split(/[#?]/)[0]];
      if (!replaced && base) replaced = manifest[removeBase(url, base)];
      if (replaced) str = str.replace(url, prefix + removeBase(replaced, strip.replace(/^\//, '')));
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(line));
      return str;
    });

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
