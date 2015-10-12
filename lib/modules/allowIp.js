/*jslint node: true*/

var exports;
(function() {
	'use strict';
	var //deferred = require('deferred'),
	//promisify = deferred.promisify,
	//fs = require('fs'),
		iplist,
		//ipFilePath,
		modAllowIp;

	modAllowIp = function(request) {
		var incomingIp = request.connection.remoteAddress;
		incomingIp = incomingIp.split('.');

		return iplist.some(function(ip) {
			var i, allowIpAry = ip.split('.');
			for (i = 0; i < 4; i++) {
				if (allowIpAry[i] !== '*' && allowIpAry[i] !== incomingIp[i]) {
					return false;
				}
				if (i === 3 || (allowIpAry[i] === '*' && i === allowIpAry.length - 1)) {
					return true;
				}
			}
		});
	};

	modAllowIp.defaultConf = {
		ips: ['*']
	};

	modAllowIp.init = function(macFiddler) {
		iplist = this.conf.ips;
	};

	modAllowIp.connect = function(request, response, next) {
		if (!modAllowIp(request)) {
			var errorMsg = "Error: IP " + request.connection.remoteAddress + " is not allowed";
			response.writeHead(500);
			response.write(errorMsg);
			response.end();
		} else {
			next();
		}
	};

	if (exports === undefined) {
		exports = {};
	}
	exports.allowIp = modAllowIp;
}());