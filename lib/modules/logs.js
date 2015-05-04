/*jslint node: true*/

var exports;
(function () {
	'use strict';
	var deferred = require('deferred'),
		promisify = deferred.promisify,
		fs = require('fs'),
		zlib = require('zlib'),
		path = require('path'),
		MemoryStream = require('memorystream'),
		bone,
		noop,
		modLogs,
		isStream = function(s) {
			var Stream = require('stream');

			return (s instanceof Stream);
		};

	modLogs = {
		stream: null,

		writeCount: {},

		getStream: function() {
			var that = this;
			if (!this.stream) {
				if(isStream(this.visitLog)) {
					this.stream = this.path;
				} else {
					var p = bone.fs.pathResolve(this.visitLog);
					this.stream = bone.fs.createWriteStream(p, {
						flags: 'a',
						encoding: 'utf8',
						focus: true
					});
				}
			}
			if (!this.stream) {
				this.rotateFile(this.visitLog, function() {
					that.stream = null;
				});
			}

			return this.stream;
		},

		log: function(msg) {
			var tm = new Date(),
				idx;
			tm = tm.toLocaleDateString() + ' ' + tm.toLocaleTimeString();

			if (!/^(Info|Warning|Error):/.test(msg)) {
				msg = 'Info: ' + msg;
			}
			idx = msg.indexOf(' ');
			msg = msg.substr(0, idx + 1) + tm + ',' + msg.substr(idx) + '\n';

			this.getStream().write(msg, 'utf8');
		},
		getStreamByCt: function(contentType) {
			var enc;

			enc = contentType.match(/charset=([a-z\-0-9]+)/i);
			enc = (enc && enc[1]) || 'utf8';

			if (/(gbk|gb2312|gb18030)/i.test(enc)) {
				enc = 'gb18030';
			}

			//iso-8859-1: Latin-1, first 256 of Unicode
			if (/(utf8|utf-8|utf_8|iso-8859-1)/i.test(enc)) {
				enc = 'utf-8';
			}

			if(isStream(this.responseLog)) {
				return this.responseLog;
			} else {
				var logFileName = bone.fs.pathResolve(this.responseLog)+'.'+enc;

				this.rotateFile(logFileName);

				return bone.fs.createWriteStream(logFileName, {
					flags: 'a',
					encoding: enc,
					focus: true
				});
			}
		},

		logResponse: function(url, response) {
			var memStream,
				header,
				headers = response.headers,
				ct = headers['content-type'] || '',
				that = this,
				resHeader,
				bufferQueue = [],

				onDecode = function(err, bodyBuf) {
					var writer;
					if (err) {
						bodyBuf = 'Error: Fail to decode: ' + url + ' ' + err;
						that.log(bodyBuf);
					}
					writer = that.getStreamByCt(ct);
					writer.write(resHeader.join('\n'));
					writer.write(bodyBuf);
					writer.end('\n\n\n');
				};

			if (!this.enalbeResponse) {
				return;
			}
			if (ct.match(/text\/html/i)) {

				resHeader = [
					(new Date()).toLocaleString(),
					response.statusCode + ' ' + url
				];
				for (header in headers) {
					if (headers.hasOwnProperty(header)) {
						resHeader.push(header + ': ' + headers[header]);
					}
				}
				resHeader.push('\n');

				memStream = new MemoryStream();

				memStream.on('data', function(chunk) {
					bufferQueue.push(chunk);
				});

				memStream.on('end', function() {
					var bufferAll;

					bufferQueue.push(new Buffer('\n\n'));

					bufferAll = Buffer.concat(bufferQueue);

					switch (headers['content-encoding']) {
						case 'gzip':
							zlib.gunzip(bufferAll, onDecode);
							break;
						case 'deflate':
							zlib.inflate(bufferAll, function(err, result) {
								if (err && err.code === 'Z_DATA_ERROR') {
									zlib.inflateRaw(bufferAll, onDecode);
								} else {
									onDecode(err, result);
								}
							});
							break;
						default:
							onDecode(null, bufferAll);
							break;
					}
				});

				response.pipe(memStream);
			}
		},

		rotateFile: function(filePath, cb) {
			var max = this.conf.maxSize,
				count;

			cb = cb || noop;

			count = (this.writeCount[filePath] || 0) + 1;
			this.writeCount[filePath] = count;

			if (count === 1 || count % 100 === 0) {
				fs.exists(filePath, function(exists) {
					if (exists) {
						promisify(fs.stat)(filePath)(function(stats) {
							if (stats.size > max * 1024 * 1024) { //10M
								fs.rename(filePath, filePath + '.old', cb);
							}
						});
					}
				});
			}
		},

		defaultConf: {
			maxSize: 10,
			enableLog: false,
			visitLog: '~/bone-cli-proxy/visit.log',
			enableResponseLog: false,
			responseLog: '~/bone-cli-proxy/response.log'
		},

		init: function(macFiddler) {
			var conf = this.conf;
			noop = macFiddler.noop;
			bone = macFiddler.bone;

			this.enalbeResponse = conf.enableResponseLog;
			// visitLog
			this.visitLog = conf.visitLog;
			this.responseLog = conf.responseLog;
		}
	};

	if (exports === undefined) {
		exports = {};
	}
	exports.logs = modLogs;

}());
