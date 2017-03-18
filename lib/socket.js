"use strict";
const WebSocket = require('ws');
const utils = require('./utils');
const log = utils.logger;

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.WebSocketManager";

/**
 * Used to handle inbound messages and provides a broadcase method.
 */
const WebSocketManager = function () {

	log.info("Private WebSocketManager constructor called.");

	let self = this;

	/**
	 * Registered callbacks for when a message comes in.
	 */
	let _registered = [];

	/**
	 * Internally stored WebSocket Server.
	 */
	let _wss = null;

	/**
	 * Loop over the registered callbacks, and pass the message.
	 */
	let handleMessage = function(user, message, flags) {
		let payload = flags.binary ? { type: 'UPLOAD_FILE', file: message.toString() } : JSON.parse(message);
		let match = false;
		log.debug("Message Received in handleMessage: %j", payload);
		_registered.forEach(function(r) {
			if(r.type === payload.type) {
				r.handler(user, payload);
				match = true;
			}
		});
		if(!match) {
			throw new Error(`Could not match for message type ${payload.type}.`);
		}
	};

	/**
	 * Load the WebSocket Server into the object.
	 */
	self.initialize = function(wss) {
		_wss = wss;
		_wss.on('connection', function connection(client) {
			let parts = client.upgradeReq.url.split('='); // e.g. /?user=a1
			let userId = parts[1];
			log.debug(`User ${userId} connected via client socket.`);
			client.user = userId;
			client.on('message', function message(message, flags) {
				handleMessage(client.user, message, flags);
			});
			client.on('error', function error(error) {
				log.error(error);
			});
			client.on('close', function close(code, reason) {
				log.debug(`Client socket closed.  User=${client.user} Code=${code} Reason=${reason}`);
			});
		});
		_wss.on('error', function error(error) {
			log.error(error);
		});
	};

	/**
	 * Send a message to a specific client.
	 */
	self.send = function(user, data) {
		if(_wss === null) {
			throw "WebSocket Server (wss) is not initialized.";
		}
		log.debug("WebSocket Server sending to %s: %j", user, data);
		_wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN && client.user === user) {
				client.send(JSON.stringify(data));
			}
		});
	};

	/**
	 * Send a message to every client.
	 */
	self.broadcast = function(data) {
		if(_wss === null) {
			throw "WebSocket Server (wss) is not initialized.";
		}
		log.debug("WebSocket Server broadcasting to all: %j", data);
		_wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(data));
			}
		});
	};

	/**
	 * Register a handler when messages are received.
	 * @param {String} messageType E.g. BID, ASK, CANCEL.
	 * @param {Function} callbackFunction The handler when the type matches.
	 */
	self.registerOnMessage = function(messageType, callbackFunction) {
		_registered.push({type: messageType, handler: callbackFunction});
		log.debug(`Registered ${messageType} from ${callbackFunction.name}.`);
	};

}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, WebSocketManager);
	}
});
