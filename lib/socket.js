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

	this.MESSAGE_TYPE = {
		BID: {value: 0, name: "BID"},
		ASK: {value: 1, name: "ASK"},
		BUY: {value: 2, name: "BUY"},
		SELL: {value: 3, name: "SELL"},
		CANCEL: {value: 4, name: "CANCEL"},
		CHAT: {value: 5, name: "CHAT"},
		BLOCK: {value: 6, name: "BLOCK"},
		UNBLOCK: {value: 7, name: "UNBLOCK"},
	};

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
		log.debug("Message Received in handleMessage: %j", message);
		_registered.forEach(function(r) {
			if(r.type.value === message.type.value) {
				r.handler(message);
			}
		});
	};

	/**
	 * Load the WebSocket Server into the object.
	 */
	this.initialize = function(wss) {
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
	this.broadcast = function(data) {
		if(_wss === null) {
			throw "WebSocket Server (wss) is not initialized.";
		}
		_wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};

	/**
	 * Register a handler when messages are received.
	 * @param {String} messageType E.g. BID, ASK, CANCEL.
	 * @param {Function} callbackFunction The handler when the type matches.
	 */
	this.registerOnMessage = function(messageType, callbackFunction) {
		_registered.push({type: messageType, handler: callbackFunction});
	};

}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, WebSocketManager);
	}
});
