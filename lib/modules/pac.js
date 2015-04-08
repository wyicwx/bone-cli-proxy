/*jslint node: true*/

var exports;
(function () {
  'use strict';
  var deferred = require('deferred'),
    promisify = deferred.promisify,
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    iconv = require('iconv-lite'),
    exists = promisify(fs.exists),
    readFile = promisify(fs.readFile),
    bone,
    log,
    modPac;

  function shExpMatch(url, pattern) {
    url = url || '';
    var pChar,
      isAggressive = false,
      pIndex,
      urlIndex = 0,
      patternLength = pattern.length,
      urlLength = url.length;
    for (pIndex = 0; pIndex < patternLength; pIndex += 1) {
      pChar = pattern[pIndex];
      switch (pChar) {
      case "?":
        isAggressive = false;
        urlIndex += 1;
        break;
      case "*":
        if (pIndex === patternLength - 1) {
          urlIndex = urlLength;
        } else {
          isAggressive = true;
        }
        break;
      default:
        if (isAggressive) {
          urlIndex = url.indexOf(pChar, urlIndex);
          if (urlIndex < 0) {
            return false;
          }
          isAggressive = false;
        } else {
          if (urlIndex >= urlLength || url[urlIndex] !== pChar) {
            return false;
          }
        }
        urlIndex += 1;
      }
    }
    return urlIndex === urlLength;
  }

  modPac = {
    pacReady : deferred(),

    strBrowserPac : '',

    findProxyFromPac : function () {
      return 'DIRECT';
    },

    findProxyForURL : function (url, host) {
      var i, j, len, rule, matched,
        rules = this.conf.proxyRules;

      for (i in rules) {
        if (rules.hasOwnProperty(i)) {
          rule = rules[i];
          len = rule.length;
          for (j = 0; j < len; j++) {
            matched = rule[j].indexOf('/') > -1 ?
                shExpMatch(url, rule[j]) :
                shExpMatch(host, rule[j]);
            if (matched) {
              return i;
            }
          }
        }
      }

      return this.findProxyFromPac(url, host);
    },

    getBrowserPac : function () {
      var browserPacPath = this.browserPacPath,
        that = this,
        def = deferred();

      if (this.strBrowserPac) {
        def.resolve(this.strBrowserPac);
      } else {
        // deferred 有bug，暂时先这么处理
        fs.exists(browserPacPath, function(err, exists) {
          if(err) {
            log('Error: fail to execute exists: ' + browserPacPath);
          } else {
            if (exists) {
              readFile(browserPacPath, 'utf8')(function (content) {
                that.strBrowserPac = content;
                def.resolve(content);
              });
            } else {
              that.pacReady.promise()(function () {
                def.resolve(that.strBrowserPac);
              });
            }
          }
        });
        /*exists(browserPacPath)(function (exists) {
          if (exists) {
            readFile(browserPacPath, 'utf8')(function (content) {
              that.strBrowserPac = content;
              def.resolve(content);
            });
          } else {
            that.pacReady.promise()(function () {
              def.resolve(that.strBrowserPac);
            });
          }
        });*/
      }

      return def.promise();
    },

    makePac : function () {
      var that = this,
        req,
        pacURI = this.originalPacURI || false,
        enc = this.conf.pacEncoding,
        cachedPacPath = this.cachedPacPath,

        writer = bone.fs.createWriteStream(cachedPacPath, {
          flags : 'w',
          encoding : enc,
          focus: true
        });

      writer.on('finish', function () {
        that.updateProxyPolicy();
      });
      if(pacURI === true) {
        writer.write('function FindProxyForURL(url, host) { \
          if (shExpMatch(host,"*")) {\
            return "DIRECT";\
          } else {\
            return "DIRECT"; \
          } \
        }')
        writer.end();
      } else if (pacURI.indexOf('http://') === 0) {
        req = http.get(pacURI, function (res) {
          res.pipe(writer);
        });
        req.on('socket', function (socket) {
          socket.setTimeout(8000);
          socket.on('timeout', function() {
            req.abort();
          });
        });
        req.on('error', function () {
          log('Error: Fail to load pac: ' + pacURI);
          writer.end();
        });
      } else {
        // deferred 有bug，暂时先这么处理
        fs.exists(pacURI, function(err, fileExist) {
          if(err) {
            log('Error: Fail to execute exists: ' + pacURI);
          } else {
            if (fileExist) {
              fs.createReadStream(pacURI).pipe(writer);
            } else {
              if (pacURI) {
                log('Error: Fail to load pac: ' + pacURI);
              }
              writer.end();
            }
          }
        });
        /*exists(pacURI)(function (fileExist) {
          if (fileExist) {
            fs.createReadStream(pacURI).pipe(writer);
          } else {
            if (pacURI) {
              log('Error: Fail to load pac: ' + pacURI);
            }
            writer.end();
          }
        });*/
      }
    },

    updateProxyPolicy : function () {
      var enc = this.conf.pacEncoding,
        browserPacTmpl = this.browserPacTmpl,
        proxyPacTmpl = this.proxyPacTmpl,
        policyPath = this.proxyPolicyPath,
        browserPacPath = this.browserPacPath,
        that = this,
        defProxyPac = deferred(),
        defBrowserPac = deferred(),
        filterFn = this.conf.pacFilter;

      if(filterFn == 'auto') {
        filterFn = this.makeDefaultFilter();
      }

      readFile(this.cachedPacPath).done(function (content) {
        content = iconv.decode(content, enc).trim();
        if (content === '') {
          content = 'var FindProxyForURL;';
        }
        readFile(proxyPacTmpl, 'utf8').done(function (tmpl) {
          var writer;
          tmpl = tmpl.replace('{$realPac}', content);

          writer = fs.createWriteStream(policyPath, {
            flags : 'w',
            encoding : enc
          });

          writer.on('finish', function () {
            that.findProxyFromPac = require(policyPath).findProxyFromPac;
            defProxyPac.resolve();
          });
          writer.end(tmpl);
        });

        readFile(browserPacTmpl, 'utf8').done(function (tmpl) {
          var writer,
            strFilter = filterFn.toString().
              replace('function (url, host)', 'function filter(url, host)');

          tmpl = tmpl.
            replace('{$realPac}', content).
            replace('{$filterFn}', strFilter).
            replace('{$proxyRules}', JSON.stringify(that.conf.proxyRules)).
            replace('{$proxyIp}', that.conf.ip).
            replace('{$proxyPort}', that.conf.port);

          that.strBrowserPac = tmpl;
          defBrowserPac.resolve();

          writer = fs.createWriteStream(browserPacPath, {
            flags : 'w',
            encoding : enc
          });

          writer.end(tmpl);
        });
      });

      deferred(defProxyPac.promise(), defBrowserPac.promise())(function () {
        that.pacReady.resolve();
        log('Info: Proxy started at : ' + that.conf.ip + ':' + that.conf.port +
            ', set your browser pac to: http://' + that.conf.ip +
            ':' + that.conf.port + '/pac');
      });
    },

    defaultConf : {
      proxyRules : {
      },
      replaceRules : {},
      pacFilter : function (url, host) {
        return true;
      },
      ip : '127.0.0.1',
      port : '8080',
      pac : '',
      pacEncoding : 'utf8'
    },

    makeDefaultFilter : function() {
      var conf = this.conf;
      var condition = [];
      if(Array.isArray(conf.replaceRules)) {
        for(var i in conf.replaceRules) {
          if(conf.replaceRules.hasOwnProperty(i)) {
            if(conf.replaceRules[i][0] instanceof RegExp) {
              condition.push(conf.replaceRules[i][0].toString()+'.test(url)');
            }
          }
        }

        if(condition.length) {
          var fn = ['function (url, host) {'];
          fn.push('if(');
          fn.push(condition.join('||'));
          fn.push('){return true}');
          fn.push('}');
          return fn.join('');
        }
      }
      return this.defaultConf.pacFilter;
    },

    init : function (macFiddler) {
      bone = macFiddler.bone;

      this.originalPacURI = this.conf.pac;
      this.cachedPacPath = path.join(__dirname, '../../', '/runtime/origin.pac');
      this.browserPacPath = path.join(__dirname, '../../', '/runtime/browser.pac');
      this.proxyPolicyPath = path.join(__dirname, '../../', '/runtime/policy.js');
      this.proxyPacTmpl = path.join(__dirname, '../../', '/lib/proxyPacTemplate.js');
      this.browserPacTmpl = path.join(__dirname, '../../', '/lib/browserPacTemplate.js');

      log = macFiddler.log;
      if(this.originalPacURI) {
        this.makePac();
        console.log('pac module enabled. visit http://0.0.0.0:'+this.conf.port+'/pac');
      }
    }
  };

  if (exports === undefined) {
    exports = {};
  }
  exports.pac = modPac;

}());

