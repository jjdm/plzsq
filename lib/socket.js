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
	let handleMessage = function(json) {
		let message = JSON.parse(json);
		let match = false;
		log.debug("Message Received in handleMessage: %j", message);
		_registered.forEach(function(r) {
			if(r.type === message.type) {
				r.handler(message);
				match = true;
			}
		});
		if(!match) {
			throw new Error(`Could not match for message type ${message.type}.`); // TODO JJDM error not logging
		}
	};

	/**
	 * Load the WebSocket Server into the object.
	 */
	self.initialize = function(wss) {
		_wss = wss;
		_wss.on('connection', function connection(ws) {
			log.debug("Websocket connected %s", Object.keys(ws));
			ws.on('message', function message(json) {
				handleMessage(json);
			});
		});
	};
	/**
	 * Send a message to every client.
	 */
	self.broadcast = function(data) {
		if(_wss === null) {
			throw "WebSocket Server (wss) is not initialized.";
		}
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
