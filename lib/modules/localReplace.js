/*jslint node: true*/

var exports;
(function () {
  'use strict';
  var deferred = require('deferred'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    replaceRules = [],
    bone,
    modEnabled,
    modLocalReplace;


  function getFilePathByRule(matchResult, rule) {
    if (!Array.isArray(rule)) {
      rule = [rule];
    }

    return rule.map(function (localPathWithDollar) {
      matchResult.forEach(function (matchName, idx) {
        if (idx > 0) {
          if (matchName === undefined) {
            matchName = '';
          }
          localPathWithDollar = localPathWithDollar
            .replace(new RegExp('\\{\\$' + idx + '\\}', 'g'), matchName);
        }
      });

      return localPathWithDollar;
    });
  }

  function pipeFile(filePath, res, modDelay, rule) {
    var file404 = rule[2];
    var def = deferred(),
      resolveWithPath = function (p) {
        var headers = {
          'Content-Type': mime.lookup(path.extname(p))
        };
        res.writeHead(200, headers);
        var reader = bone.fs.createReadStream(p);
        if (modDelay) {
          console.log
          modDelay.pipe(reader, res, function () {
            def.resolve(p);
          });
        } else {
          reader.on('end', function () {
            def.resolve(p);
          });
          reader.pipe(res);
        }
      },
      go404 = function () {
        def.reject(new Error('RegExp: '+rule[0]+'\n'+'replace: '+rule[1]));
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
            localFile = getFilePathByRule(matchUrl, rule[1]);

            var modDelay = macFiddler.mods.delayResponse;
            pipeFile(localFile[0], response,
                     modDelay && modDelay.filter(url) ? modDelay : null, rule).
              then(function (replaceFile) {
                def.resolve("Info: Replace " + url + ' with ' + replaceFile +
                            (hasBuilt ? ', autoBuild' : ''));
              }, function (err) {
                var message = ['<h1>Fail to Replace ' + url + ' with ' + localFile + '</h1>'];
                if (err.message !== '') {
                  message.push('message:');
                  message.push('<pre>'+err.message+'</pre>');
                }

                response.writeHead(404, {
                  'Content-Type': 'text/html'
                });
                response.write(message.join('\n'));
                response.end();
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

