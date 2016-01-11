/*jslint node: true*/

module.exports = function (conf) {
  return function(command, bone, fs) {
    'use strict';
    var pkg = require('./package.json');

    var path = require('path'),
      macFiddler = require('./lib/macFiddler.js');

    macFiddler.bone = bone;
    

    command('proxy')
      .version(pkg.version)
      .action(function() {
        macFiddler.fs = fs || bone.fs;
        macFiddler.init(conf);
        bone.watch();
      });
  }
};