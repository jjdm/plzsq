"use strict";
const WebSocket = require('ws');
const log = require('./utils').logger;

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.WebSocketManager";

/**
 * Used to handle inbound messages and provides a broadcase method.
 */
const constructor = function WebSocketManager(wss) {

	log.info("Private WebSocketManager constructor called.");

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
		let data = JSON.parse(json);
		console.log("message is: %j", data);
		// JJDM - you are here
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
	 * @param {String} messageType E.g. bid, ask, cancel.
	 * @param {Function} callbackFunction The handler when the type matches.
	 */
	this.registerOnMessage = function(messageType, callbackFunction) {
		_registered.push({type: messageType, handler: callbackFunction});
	};

}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, constructor());
	}
});
