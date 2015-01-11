/*jslint node: true*/

var exports;
(function () {
  'use strict';
  var deferred = require('deferred'),
    execu = require('child_process').exec,
    promisify = deferred.promisify,
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    readFile = promisify(fs.readFile),
    replaceRules = [],
    bone,
    modEnabled,
    modLocalReplace;


  function isArray(obj) {
    return Object.prototype.toString.apply(obj) === '[object Array]';
  }

  function getFilePathByRule(localPathWithDollar) {
    var REGEXP = {};
    for(var i in RegExp) {
      if(i.charAt(0) == '$') {
        REGEXP['{'+i+'}'] = RegExp[i];
      }
    }
    return localPathWithDollar.replace(/\{\$\d\}/g, function(idx) {
      return REGEXP[idx];
    });
  }

  function pipeFile(filePath, res, modDelay, file404) {
    var def = deferred(),
      resolveWithPath = function (path) {
        var reader = bone.fs.createReadStream(path);
        if (modDelay) {
          modDelay.pipe(reader, res, function () {
            def.resolve(path);
          });
        } else {
          reader.on('end', function () {
            def.resolve(path);
          });
          reader.pipe(res);
        }
      },
      go404 = function () {
        if (file404 && bone.fs.existFile(file404)) {
          resolveWithPath(file404);
        } else {
          def.reject(new Error('404'));
        }
      };

      if(bone.fs.existFile(filePath)) {
        resolveWithPath(filePath);
      } else {
        go404();
      }

    return def.promise();
  }

  modLocalReplace = function (request, response, macFiddler) {
    var headers = {
        'Cache-Control' : 'max-age=0, must-revalidate',
        'Content-Type' : 'text/plain'
      },
      url,
      def = deferred(),
      matchFound;

    url = request.url;

    if (url === '/pac') {
      response.writeHead(200, headers);

      macFiddler.mods.pac.getBrowserPac().done(function (pac) {
        response.end(pac);
        def.resolve('Info: GET Pac');
      });

    } else {
      if (modEnabled) {
        matchFound = replaceRules.some(function (rule) {
          var matchUrl,
            localFile;

          matchUrl = url.match(rule[0]);

          if (matchUrl && rule[1]) {
            localFile = getFilePathByRule(rule[1]);

            headers['Content-Type'] = mime.lookup(path.extname(localFile));

            response.writeHead(200, headers);

            var modDelay = macFiddler.mods.delayResponse;
            pipeFile(localFile, response,
                     modDelay && modDelay.filter(url) ? modDelay : null, rule[2]).
              then(function (replaceFile) {
                def.resolve("Info: Replace " + url + ' with ' + replaceFile +
                            (hasBuilt ? ', autoBuild' : ''));
              }, function (err) {
                var er = new Error('Error: Fail to Replace ' + url + ' with ' + localFile);
                if (err.message !== '') {
                  er.message += ', can Not open: ' + err.message;
                }
                def.reject(er);
              });

            return true;
          }
        });
      }

      if (!matchFound) {
        def.reject(new Error(''));
      }
    }

    return def.promise();
  };

  modLocalReplace.defaultConf = {
    replaceRules : [],
    enable : true
  };

  modLocalReplace.init = function (macFiddler) {
    var base, conf = this.conf;

    bone = macFiddler.bone;
    modEnabled = conf.enable;
  
    if (modEnabled && conf.replaceRules) {
      conf.replaceRules.forEach(function (rule) {       
        rule[1] = bone.fs.pathResolve(rule[1]);
        if (rule[2]) {
          rule[2] = rule[2].charAt(0) === '/' ? rule[2] : base + rule[2];
        }
      });

      replaceRules = conf.replaceRules;
    }

  };

  if (exports === undefined) {
    exports = {};
  }
  exports.localReplace = modLocalReplace;
}());

