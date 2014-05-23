/* jshint node:true */
'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var split = require('split2');
var chalk = require('chalk');

var PLUGIN_NAME = 'gulp-fingerprint';

var plugin = function(manifest, options) {
  var css = /url\("(.*)"\)/g;
  var regex = css; // set default regex to css
  options = options || {};

  // console.log('manifest', manifest);

  if (options.type) {
    if (options.type === 'css') regex = css;
    // ... add additional RegExp types here
  }

  // Use custom RegExp
  if (options.regex) regex = options.regex;


  function urlReplace(buf, enc, callback) {
    var line = buf.toString();
    // console.log('\n','line', line);
    var replace;
    var match = regex.exec(line);

    if (match) {
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Found:', chalk.yellow(match[1].replace(/^\//, '')));
      replace = manifest[match[1]] || manifest[match[1].replace(/^\//, '')];
      line = line.replace(match[1], replace);
      if (options.verbose) gutil.log(PLUGIN_NAME, 'Replaced:', chalk.green(line));
    }

    this.push(line);
    callback();
  }

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }
    // console.log(file.contents);

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-rev', 'Streaming not supported'));
			return cb();
    }
    // if (file.isBuffer()) {
    //   console.log('is Buffer');
    // }

    file.pipe(split())
    .pipe(through(urlReplace))
  });

};

module.exports = plugin;
