var inspector = exports.inspector = {};
try {
	// 检测ws模块，没有则不加载该模块
	require('ws');
} catch(e) {
	inspector.init = function() {};
	return;
}
var path = require('path');
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var mime = require('mime');
var url = require('url');
var zlib = require('zlib');

// the instance of server
inspector.serve;
inspector.tracks = {};
inspector.connect = function(request, response, next) {
	var serve = this.serve;
	var url = request.url;

	if(url == '/inspector/inspector.json') {
		response.writeHead(200, {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=0'
		});
		var file = path.join(__dirname+'/../../public/node/', 'inspector.json');
		file = fs.createReadStream(file);
		file.pipe(response);
	} else if(url.indexOf('/inspector/node') == 0) {
		response.writeHead(302, {
			'Location': request.url.replace('/inspector', '')
		});
		response.end();
	} else {
		serve(request, response, function() {
			inspector.trackRequest(request, response);
			next();
		});
	}
};
// 
inspector.trackRequest = function(request, response) {
	if(!inspector.sessions.length) return;
	var track = new TrackRequest(request, response);
	this.tracks[track.id] = track;
};
// publish socket message to all socket
inspector.publish = function(data) {
	this.sessions.forEach(function(session) {
		if(session.ready) {
			session.send(data);
		}
	});
};
// session queue
inspector.sessions = [];

inspector.init = function() {
	'use strict';
	var serveStatic = require('serve-static');
	var serve = this.serve = serveStatic(__dirname+'/../../public', {
		index: ['inspector.html', 'index.html']
	});
	this.wsServer = new WebSocketServer({
		server: this.app.server
	});
	this.wsServer.on('connection', function(socket) {
		var session = new Session(socket);
		inspector.sessions.push(session);
	});
};

inspector.checkAndClearSession = function() {
	if(!inspector.sessions.length) {
		for(var i in inspector.tracks) {
			inspector.tracks[i].destroy();
		}
	}
};

function getTimestamp() {
	return Date.now() / 1000;
}

function TrackRequest(request, response) {
	var track = this;

	this.id = TrackRequest.id++;
	this.request = request;
	this.response = response;
	this.url = request.url;
	this.urlParse = url.parse(this.url);
	this.mime = mime.lookup(this.urlParse.pathname);
	this.types = TrackRequest.Types[9];

	this.requestData = [];
	this.responseData = [];
	this.responseHeader = {};

	this.id = this.id.toString();
	
	this.mimeToType();

	request.on('data', function(trunk) {
		track.requestData.push(trunk);
	});

	request.on('end', function() {
		track.requestWillBeSent();
		// 防止内存泄漏
		delete track.requestData;
	});

	response.on('finish', function() {
		var responseData = Buffer.concat(track.responseData);
		var onDecode = function(error, data) {
			if(Buffer.isBuffer(data)) {
				track.responseData = data;
			} else {
				track.responseData = new Buffer(data);
			}
			track.dataReceived();
			track.loadingFinished();
		};
		// gzip 解码
		if(track.responseHeader['content-encoding'] === 'gzip') {
			zlib.gunzip(responseData, onDecode);
		} else {
			onDecode(null, responseData);
		}
	});

	response.on('close', function() {
		// 防止内存泄漏
		track.destroy();
	});

	var writeHead = response.writeHead;
	response.writeHead = function(statusCode, statusMessage, headers) {
		if(!headers) {
			headers = statusMessage;
		}
		track.responseHeader = headers || {};
		track.responseReceived();
		writeHead.apply(response, arguments);
	};

	var write = response.write;
	response.write = function(trunk, encoding) {
		if(trunk) {
			if(!(trunk instanceof Buffer)) {
				track.responseData.push(new Buffer(trunk));
			} else {
				track.responseData.push(trunk);
			}
		}
		write.apply(response, arguments);
	};
	var end = response.end;
	response.end = function(trunk, encoding) {
		if(trunk) {
			if(!(trunk instanceof Buffer)) {
				track.responseData.push(new Buffer(trunk, encoding));
			} else {
				track.responseData.push(trunk);
			}
		}
		end.apply(response, arguments);
	};
};

TrackRequest.prototype.mimeToType = function() {
	switch(this.mime) {
		case 'text/css':
			this.types = TrackRequest.Types[1];
		break;
		case 'text/javascript':
		case 'application/javascript':
			this.types = TrackRequest.Types[4];
		break;
		case 'text/html':
			this.types = TrackRequest.Types[0];
		break;
		case 'image/jpeg':
		case 'image/png':
		case 'image/gif':
			this.types = TrackRequest.Types[2];
		break;
	}
};

TrackRequest.prototype.requestWillBeSent = function() {
	var data = {
		method: 'Network.requestWillBeSent',
		params: {
			requestId: this.id,
			frameId: this.id,
			loaderId: this.id,
			documentURL: this.request.url,
			request: {
				method: this.request.method,
				url: this.request.url,
				postData: Buffer.concat(this.requestData).toString(),
				headers: this.request.headers
			},
			timestamp: getTimestamp(),
			initiator: null,
			redirectResponse: '',
			type: this.types
		}
	};

	inspector.publish(data);
};

TrackRequest.prototype.responseReceived = function() {
	var headers = this.responseHeader;

	for(var i in headers) {
		if(Array.isArray(headers[i])) {
			headers[i] = headers[i].join('');
		}
	}

	var data = {
		method: 'Network.responseReceived',
		params: {
			requestId: this.id,
			frameId: this.id,
			loaderId: this.id,
			timestamp: getTimestamp(),
			type: this.types,
			response: {
				connectionId: this.id,
				connectionReused: false,
				fromDiskCache: false,
				headers: headers,
				headersText: null,
				mimeType: this.mime,
				requestHeaders: null,
				requestHeadersText: this.response._header ? this.response._header: null,
				status: this.response.statusCode,
				statusText: this.response.statusMessage || '',
				url: this.request.url
			}
		}
	};

	inspector.publish(data);
};

TrackRequest.prototype.dataReceived = function() {
	var responseData = this.responseData;

	var data = {
		method: 'Network.dataReceived',
		params: {
			requestId: this.id,
			timestamp: getTimestamp(),
			dataLength: responseData.length,
			encodedDataLength: responseData.length
		}
	};

	inspector.publish(data);
};

TrackRequest.prototype.loadingFinished = function() {
	var data = {
		method: 'Network.loadingFinished',
		params: {
			requestId: this.id,
			timestamp: getTimestamp()
		}
	}

	inspector.publish(data);
};

TrackRequest.prototype.loadingFailed = function() {
	var data = {
		method: 'Network.loadingFailed',
		params: {
			requestId: this.id,
			timestamp: getTimestamp()
		}
	};

	inspector.publish(data);
};

TrackRequest.prototype.destroy = function() {
	delete this.requestData;
	delete inspector.tracks[this.id];
	delete this.responseData;
	delete this.request;
	delete this.response;
};

TrackRequest.id = 1;
TrackRequest.Types = [
	'Document',
	'Stylesheet',
	'Image',
	'Media',
	'Script',
	'XHR',
	'Font',
	'TextTrack',
	'WebSocket',
	'Other'
];

function Session(socket) {
	this.socket = socket;
	this.ready = false;

	socket.on('message', this.msgHandler.bind(this));
	socket.on('close', this.destroy.bind(this));
}

Session.prototype.msgHandler = function(message) {
	var data = JSON.parse(message);
	var specialCommands = Session.specialCommands;
	var ignoreCommands = Session.ignoreCommands;

	if(data.method in specialCommands) {
		this.send({
			id: data.id,
			result: specialCommands[data.method]
		});
	} else if(data.method in ignoreCommands) {
		return;
	} else if(data.method === 'Network.getResponseBody') {
		this.handleBody(data.id, data.params.requestId);
	} else {
		this.send({
			id: data.id
		});
	}
	if(data.method === 'Network.enable') {
		this.ready = true;
	}
};

Session.prototype.handleBody = function(id, requestId) {
	var track = inspector.tracks[requestId];

	if(track) {
		this.send({
			id: id,
			error: null,
			result: {
				body: track.responseData.toString(),
				base64Encoded: false
			}
		});
	}
};

Session.prototype.destroy = function() {
	var index = inspector.sessions.indexOf(this);

	inspector.sessions.splice(index, 1);
	this.socket = null;
};

Session.prototype.send = function(data) {
	if(this.socket) {
		this.socket.send(JSON.stringify(data));
	}
};

Session.specialCommands = {
	'Page.canScreencast': false,
	'Page.canEmulate': false,
	'Worker.canInspectWorkers': false
};

Session.ignoreCommands = {
	'Page.getResourceTree': true,
	'Debugger.enable': true,
	'Debugger.setPauseOnExceptions': true
};