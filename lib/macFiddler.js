/*jslint node: true*/

var module;
(function() {
	'use strict';
	var http = require('http'),

		net = require('net'),

		scriptBase = __dirname + '/..',

		noop = function() {},

		log = noop,

		macFiddler;

	function extend(r, s, override) {
		var i;

		override = override === true ? true : false;

		for (i in s) {
			if (s.hasOwnProperty(i) && (override || r[i] === undefined)) {
				r[i] = s[i];
			}
		}
	}

	macFiddler = {
		availableMods: ['logs', 'hosts', 'localReplace', 'allowIp', 'proxyRequest', 'pac',
			'delayResponse', 'inspector'
		],

		mods: {},

		conf: {},

		noop: noop,

		extend: extend,

		log: function(msg) {
			log(msg);
		},

		connects: [],
		// simple connect model
		connect: function() {
			var self = this;
			return function(request, response, cb) {
				var index = 0;
				var next = function() {
					var middler = self.connects[index];
					if (middler) {
						index++;
						middler(request, response, next);
					} else {
						cb && cb();
					}
				};
				next();
			};
		},

		loadModule: function(name) {
			var mod;

			mod = this.mods[name];

			if (!mod && this.availableMods.indexOf(name) > -1) {
				mod = require(scriptBase + '/lib/modules/' + name + '.js')[name];

				if (mod) {
					this.mods[name] = mod;
				}
			}

			return mod;
		},

		use: function(modName, conf) {
			var mod = this.loadModule(modName);
			if (mod) {
				mod.conf = conf || {};
				mod.app = this;
				if (mod.connect) {
					this.connects.push(function() {
						mod.connect.apply(mod, arguments);
					});
				}
			}
		},

		set: function(conf) {
			extend(this.conf, conf, true);
		},

		initMods: function() {
			var usedMods = this.mods,
				modName, mod, conf = this.conf;

			if (!usedMods.allowIp) {
				this.use('allowIp', {
					ips: conf.allowIps
				});
			}

			if (!usedMods.inspector) {
				this.use('inspector');
			}

			if (!usedMods.logs && conf.enableLog) {
				this.use('logs', {
					maxSize: conf.maxLogSize,
					visitLog: conf.visitLog,
					responseLog: conf.responseLog,
					enableResponseLog: conf.enableResponseLog
				});
			}

			if (!usedMods.pac) {
				this.use('pac', {
					pac: conf.pac,
					ip: conf.ip,
					port: conf.port,
					pacEncoding: conf.pacEncoding,
					proxyRules: conf.proxyRules,
					pacFilter: conf.pacFilter,
					replaceRules: conf.replaceRules
				});
			}

			if (!usedMods.localReplace) {
				this.use('localReplace', {
					enable: conf.enableReplace,
					replaceBase: conf.replaceBase,
					replaceRules: conf.replaceRules,
					autoBuild: conf.autoBuild
				});
			}

			if (!usedMods.hosts && conf.hostsFile) {
				this.use('hosts', {
					hostsFile: conf.hostsFile,
				});
			}

			if (!usedMods.proxyRequest && conf.enableProxyRequest) {
				this.use('proxyRequest');
			}

			if (!usedMods.delayResponse) {
				this.use('delayResponse', {
					delay: conf.delay,
					filter: conf.delayFilter
				});
			}

			for (modName in usedMods) {
				if (usedMods.hasOwnProperty(modName)) {
					mod = usedMods[modName];
					extend(mod.conf, mod.defaultConf);
					mod.init(this);
				}
			}
		},

		defaultConf: require('../default.conf.js'),

		init: function(conf) {
			var that = this,
				usedMods;
			var portscanner = require('portscanner');

			extend(this.conf, this.defaultConf);
			extend(this.conf, conf, true);

			http.globalAgent.maxSockets = Infinity;

			this.server = http.createServer(function(request, response) {
				var connect = that.connect();
				response.setHeader('Access-Control-Allow-Origin', '*');

				connect(request, response, function() {
					response.write('proxy server: forbbiden');
					response.end();
				});
			});

			this.server.on('connect', function(req, socket, head) { // 处理https
				try {
					var self = this;

					function _synReply(socket, code, reason, headers, cb) {
						try {
							var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
							var headerLines = '';
							for (var key in headers) {
								headerLines += key + ': ' + headers[key] + '\r\n';
							}
							socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
						} catch (error) {
							cb(error);
						}
					}

					var requestOptions = {
						host: req.url.split(':')[0],
						port: req.url.split(':')[1] || 443
					};

					self.emit("beforeRequest", requestOptions);
					connectRemote(requestOptions, socket);

					function ontargeterror(e) {
						console.log(req.url + " Tunnel error: " + e);
						_synReply(socket, 502, "Tunnel Error", {}, function() {
							try {
								socket.end();
							} catch (e) {
								console.log('end error' + e.message);
							}

						});
					}

					function connectRemote(requestOptions, socket) {
						var tunnel = net.createConnection(requestOptions, function() {
							//format http protocol
							_synReply(socket, 200, 'Connection established', {
									'Connection': 'keep-alive',
									'Proxy-Agent': 'Bone Proxy 1.0'
								},
								function(error) {
									if (error) {
										console.log("syn error", error.message);
										tunnel.end();
										socket.end();
										return;
									}
									tunnel.pipe(socket);
									socket.pipe(tunnel);
								}
							);
						});

						tunnel.setNoDelay(true);

						tunnel.on('error', ontargeterror);
					}
				} catch (e) {
					console.log("connectHandler error: " + e.message);
				}
			});
			this.initMods();
			usedMods = this.mods;

			if (usedMods.logs) {
				log = usedMods.logs.log.bind(usedMods.logs);
			}

			portscanner.findAPortNotInUse(this.conf.port, this.conf.port + 10, '127.0.0.1', function(error, foundPort) {
				// if the found port doesn't match the option port, and we are forced to use the option port
				if (that.conf.port !== foundPort) {
					console.log('Port ' + that.conf.port + ' is already in use by another process.');
					process.exit();
					return;
				}
				that.server.on('error', function(err) {
					if (err.code === 'EADDRINUSE') {
						console.log('Port ' + that.conf.port + ' is already in use by another process.');
					} else {
						console.log(err);
					}
				}).on('listening', function() {
					console.log('Started http proxy server on http://0.0.0.0:' + that.conf.port);
					that.bone.watch();
				}).listen(that.conf.port);
			});


		}
	};

	module.exports = macFiddler;
}());