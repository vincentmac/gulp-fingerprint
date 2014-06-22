'use strict';

var chalk = require('chalk');
var gutil = require('gulp-util');
var path = require('path');
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
  var base = '';
  var strip = '';
  var mode = 'regex';
  var content = [];

  // Use custom RegExp
  if (options.regex) regex = options.regex;

  if (options.prefix) prefix = options.prefix;

  if (options.base) base = options.base.replace(/^\//, '');

  if (options.strip) strip = options.strip.replace(/^\//, '');

  if (options.mode === 'replace') {
    mode = 'replace';
  }

  if (strip) {
    var stripRegex = new RegExp('^\/' + strip + '|^' + strip);
  }

  if (base) {
    var baseRegex = new RegExp('^\/' + base + '|^' + base);
  }

  if (typeof(manifest) === 'string') {
    manifest = require(path.resolve(manifest));
  }

  function regexMode(buf, enc, cb) {
    var line = buf.toString();

    line = line.replace(regex, function(str, i) {
      var url = Array.prototype.slice.call(arguments, 1).filter(function(a) {return a;})[0];
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(url.replace(/^\//, '')));
      var replaced = manifest[url] || manifest[url.replace(/^\//, '')] || manifest[url.split(/[#?]/)[0]];
      if (!replaced && base) replaced = manifest[url.replace(baseRegex, '')];
      if (replaced) {
        if (strip) {
          replaced = replaced.replace(stripRegex, '');
        }
        str = str.replace(url, prefix + replaced);
      }
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(prefix + replaced));
      return str;
    });

    content.push(line);
    cb();
  }

  function replaceMode(buf, enc, cb) {
    var line = buf.toString();

    base = base.replace(/(^\/|\/$)/g, '');

    for (var url in manifest) {
      var dest = manifest[url], replaced, bases;
      if (strip) {
        replaced = prefix + dest.replace(stripRegex, '');
      } else {
        replaced = prefix + dest;
      }
      bases = ['/', ''];
      if (base) {
        bases.unshift('/' + base + '/', base + '/');
      }
      for (var i = 0; i < bases.length; i++) {
        var newLine = line.split(bases[i] + url).join(replaced);
        if (line !== newLine) {
          if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(url.replace(/^\//, '')));
          if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(prefix + replaced));
          line = newLine;
          break;
        }
      }
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
      .pipe(through(mode === 'regex' ? regexMode : replaceMode,  function(callback) {
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
