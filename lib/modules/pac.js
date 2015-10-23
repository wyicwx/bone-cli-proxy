/*jslint node: true*/

var exports;
(function() {
	'use strict';
	var deferred = require('deferred'),
		promisify = deferred.promisify,
		fs = require('fs'),
		path = require('path'),
		http = require('http'),
		iconv = require('iconv-lite'),
		lstat = promisify(fs.lstat),
		readFile = promisify(fs.readFile),
		bone,
		bonefs,
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
		pacReady: deferred(),

		strBrowserPac: '',

		findProxyFromPac: function() {
			return 'DIRECT';
		},

		findProxyForURL: function(url, host) {
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

		getBrowserPac: function() {
			var browserPacPath = this.browserPacPath,
				that = this,
				def = deferred();

			if (this.strBrowserPac) {
				def.resolve(this.strBrowserPac);
			} else {
				// fs.exists is not a node callback type, here rely on fs.lstat to check whether a flie exists
				lstat(browserPacPath)(function(stat) {
					readFile(browserPacPath, 'utf8')(function(content) {
						that.strBrowserPac = content;
						def.resolve(content);
					});
				}, function(err) {
					if (err.errno === -2) {
						that.pacReady.promise()(function() {
							def.resolve(that.strBrowserPac);
						});
					}
				});
			}

			return def.promise();
		},

		makePac: function() {
			var that = this,
				req,
				pacURI = this.originalPacURI || false,
				enc = this.conf.pacEncoding,
				cachedPacPath = this.cachedPacPath,

				writer = bonefs.createWriteStream(cachedPacPath, {
					flags: 'w',
					focus: true
				});

			writer.on('finish', function() {
				that.updateProxyPolicy();
			});
			if (pacURI === true) {
				writer.write('function FindProxyForURL(url, host) { \
          if (shExpMatch(host,"*")) {\
            return "DIRECT";\
          } else {\
            return "DIRECT"; \
          } \
        }')
				writer.end();
			} else if (pacURI.indexOf('http://') === 0) {
				req = http.get(pacURI, function(res) {
					res.pipe(writer);
				});
				req.on('socket', function(socket) {
					socket.setTimeout(8000);
					socket.on('timeout', function() {
						req.abort();
					});
				});
				req.on('error', function() {
					log('Error: Fail to load pac: ' + pacURI);
					writer.end();
				});
			} else {
				// fs.exists is not a node callback type, here rely on fs.lstat to check whether a flie exists
				lstat(pacURI)(function(stat) {
					fs.createReadStream(pacURI).pipe(writer);
				}, function(err) {
					if (err.errno === -2) {
						if (pacURI) {
							log('Error: Fail to load pac: ' + pacURI);
						}
						writer.end();
					}
				});
			}
		},

		updateProxyPolicy: function() {
			var enc = this.conf.pacEncoding,
				browserPacTmpl = this.browserPacTmpl,
				proxyPacTmpl = this.proxyPacTmpl,
				policyPath = this.proxyPolicyPath,
				browserPacPath = this.browserPacPath,
				that = this,
				defProxyPac = deferred(),
				defBrowserPac = deferred(),
				filterFn = this.conf.pacFilter;

			if (filterFn == 'auto') {
				filterFn = this.makeDefaultFilter();
			}

			readFile(this.cachedPacPath).done(function(content) {
				content = iconv.decode(content, enc).trim();
				if (content === '') {
					content = 'var FindProxyForURL;';
				}
				readFile(proxyPacTmpl, 'utf8').done(function(tmpl) {
					var writer;
					tmpl = tmpl.replace('{$realPac}', content);

					writer = fs.createWriteStream(policyPath, {
						flags: 'w'
					});

					writer.on('finish', function() {
						that.findProxyFromPac = require(policyPath).findProxyFromPac;
						defProxyPac.resolve();
					});
					writer.end(tmpl);
				});

				readFile(browserPacTmpl, 'utf8').done(function(tmpl) {
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
						flags: 'w',
					});

					writer.end(tmpl);
				});
			});

			deferred(defProxyPac.promise(), defBrowserPac.promise())(function() {
				that.pacReady.resolve();
				log('Info: Proxy started at : ' + that.conf.ip + ':' + that.conf.port +
					', set your browser pac to: http://' + that.conf.ip +
					':' + that.conf.port + '/pac');
			});
		},

		defaultConf: {
			proxyRules: {},
			replaceRules: {},
			pacFilter: function(url, host) {
				return true;
			},
			ip: '127.0.0.1',
			port: '8080',
			pac: '',
			pacEncoding: 'utf8'
		},

		makeDefaultFilter: function() {
			var conf = this.conf;
			var condition = [];
			if (Array.isArray(conf.replaceRules)) {
				for (var i in conf.replaceRules) {
					if (conf.replaceRules.hasOwnProperty(i)) {
						if (conf.replaceRules[i][0] instanceof RegExp) {
							condition.push(conf.replaceRules[i][0].toString() + '.test(url)');
						}
					}
				}

				if (condition.length) {
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

		connect: function(request, response, next) {
			var url = request.url;
			var headers = {
				'Cache-Control': 'max-age=0, must-revalidate',
				'Content-Type': 'text/plain'
			};
			if (url === '/pac') {
				response.writeHead(200, headers);

				this.getBrowserPac().done(function(pac) {
					response.end(pac);
				});
			} else {
				next();
			}
		},

		init: function(macFiddler) {
			bone = macFiddler.bone;
			bonefs = macFiddler.fs;

			this.originalPacURI = this.conf.pac;
			this.cachedPacPath = path.join(__dirname, '../../', '/runtime/origin.pac');
			this.browserPacPath = path.join(__dirname, '../../', '/runtime/browser.pac');
			this.proxyPolicyPath = path.join(__dirname, '../../', '/runtime/policy.js');
			this.proxyPacTmpl = path.join(__dirname, '../../', '/lib/proxyPacTemplate.js');
			this.browserPacTmpl = path.join(__dirname, '../../', '/lib/browserPacTemplate.js');

			log = macFiddler.log;
			if (this.originalPacURI) {
				this.makePac();
				console.log('pac module enabled. visit http://0.0.0.0:' + this.conf.port + '/pac');
			}
		}
	};

	if (exports === undefined) {
		exports = {};
	}
	exports.pac = modPac;

}());