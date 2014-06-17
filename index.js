'use strict';

var _ = require('lodash');
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
  var regex = /(?:url\(["']?(.*?)['"]?\)|src=["']{1}(.*?)['"]{1}|src=([^\s\>\/]+)(?:\>|\/|\s)|href=["']{1}(.*?)['"]{1}|href=([^\s\>\/]+)(?:\>|\/|\s))/g;
  var prefix = '';
  var base;
  var content = [];

  // Use custom RegExp
  if (options.regex) regex = options.regex;

  if (options.prefix) prefix = options.prefix;

  if (options.base) base = new RegExp('^\/' + options.base + '|^' + options.base);

  function urlReplace(buf, enc, cb) {
    var line = buf.toString();
    var replaced;
    // regex.lastIndex = 0; // Reset match index when global match is on
    var match = regex.exec(line);

    if (match) {
      _.each(match, function(m) {
        if (m && !replaced) {
          if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(m.replace(/^\//, '')));
          replaced = manifest[m] || manifest[m.replace(/^\//, '')];
          if (!replaced && base) replaced = manifest[m.replace(base, '')];
          if (replaced) line = line.replace(m, prefix + replaced);

          if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(line));
        }
      });
      // if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(match[1].replace(/^\//, '')));
      // replaced = manifest[match[1]] || manifest[match[1].replace(/^\//, '')];
      // if (!replaced && base) replaced = manifest[match[1].replace(base, '')];
      // if (replaced) line = line.replace(match[1], prefix + replaced);
      //
      // if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(line));
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
