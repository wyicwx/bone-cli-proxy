/*jslint node: true*/

module.exports = function (conf) {
  return function(command, bone) {  
    'use strict';
    var pkg = require('./package.json');

    var path = require('path'),
      macFiddler = require('./lib/macFiddler.js'),
      defConf = './frontend_finance_conf.js',
      conf;

    macFiddler.bone = bone;
    conf = defConf;

    if (typeof conf === 'string') {
      conf = path.join(__dirname + '/' + conf);
    }

    command('proxy')
      .version(pkg.version)
      .action(function() {
        macFiddler.init(conf);
      });
  }
};