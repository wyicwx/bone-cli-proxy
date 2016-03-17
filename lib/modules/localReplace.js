/*jslint node: true*/

var exports;
(function() {
	'use strict';
	var deferred = require('deferred'),
		fs = require('fs'),
		path = require('path'),
		mime = require('mime'),
		replaceRules = [],
		bone,
		modEnabled,
		modLocalReplace,
		bonefs;


	function getFilePathByRule(matchResult, rule) {
		if (!Array.isArray(rule)) {
			rule = [rule];
		}

		return rule.map(function(localPathWithDollar) {
			matchResult.forEach(function(matchName, idx) {
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
			resolveWithPath = function(p) {
				var headers = {
					'Cache-Control': 'max-age=0, must-revalidate',
					'Content-Type': mime.lookup(path.extname(p))
				};
				res.writeHead(200, headers);
				var reader = bonefs.createReadStream(p);
				if (modDelay) {
					modDelay.pipe(reader, res, function() {
						def.resolve(p);
					});
				} else {
					reader.on('end', function() {
						def.resolve(p);
					});
					reader.pipe(res);
				}
			},
			go404 = function() {
				def.reject(new Error('RegExp: ' + rule[0] + '\n' + 'replace: ' + rule[1]));
			};

		var exists = false;
		for(var i in filePath) {
			if (bonefs.existFile(filePath[i])) {
				exists = true;
				resolveWithPath(filePath[i]);
				break;
			}
		}


		if (!exists) {
			go404();
		}

		return def.promise();
	}

	modLocalReplace = function(request, response, macFiddler) {
		var url,
			def = deferred(),
			matchFound;

		url = request.url;

		if (modEnabled) {
			matchFound = replaceRules.some(function(rule) {
				var matchUrl,
					localFile;

				matchUrl = url.match(rule[0]);

				if (matchUrl && rule[1]) {
					localFile = getFilePathByRule(matchUrl, rule[1]);

					var modDelay = macFiddler.mods.delayResponse;
					pipeFile(localFile, response,
						modDelay && modDelay.filter(url) ? modDelay : null, rule).
					then(function(replaceFile) {
						def.resolve("Info: Replace " + url + ' with ' + replaceFile +
							(hasBuilt ? ', autoBuild' : ''));
					}, function(err) {
						var message = ['<h1>Fail to Replace ' + url + ' with ' + localFile + '</h1>'];
						if (err.message !== '') {
							message.push('message:');
							message.push('<pre>' + err.message + '</pre>');
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

		return def.promise();
	};

	modLocalReplace.defaultConf = {
		replaceRules: [],
		enable: true
	};

	modLocalReplace.init = function(macFiddler) {
		var base, conf = this.conf;

		bone = macFiddler.bone;
		bonefs = macFiddler.fs;
		modEnabled = conf.enable;

		if (modEnabled && conf.replaceRules) {
			conf.replaceRules.forEach(function(rule) {
				if(Array.isArray(rule[1])) {
					rule[1] = rule[1].map(function(p) {
						return bonefs.pathResolve(p);
					});
				} else {
					rule[1] = bonefs.pathResolve(rule[1]);
				}

				if (rule[2]) {
					rule[2] = rule[2].charAt(0) === '/' ? rule[2] : base + rule[2];
				}
			});

			replaceRules = conf.replaceRules;
		}
	};

	modLocalReplace.connect = function(request, response, next) {
		modLocalReplace(request, response, this.app).then(function() {}, next);
	};

	if (exports === undefined) {
		exports = {};
	}
	exports.localReplace = modLocalReplace;
}());