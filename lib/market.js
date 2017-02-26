"use strict";
const utils = require('./utils');
const log = utils.logger;
const config = require('./config').instance();

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Market";

const Round = function() {

}

const Market = function () {

	log.info("Private Market constructor called.");

	let self = this;
	let _socket = null;
	let _config = config.get();
	let _currentRoundPointer = 0;
	let _rounds = [];

	/**
	 * Called when a new configuration is uploaded.
	 */
	self.reset = function() {
		// _socket remains the same
		_config = config.get();
		_currentRoundPointer = 0;
		_rounds = [];
	};

	/**
	 * Called a new ask is received.
	 */
	self.onAsk = function marketOnAsk(ask) {
		log.debug("Received ask: %j", ask);
	}

	/**
	 * Called a new bid is received.
	 */
	self.onBid = function marketOnBid(bid) {
		log.debug("Received bid: %j", bid);
		_socket.broadcast(bid);
	}

	/**
	 * Callback for socket/WSS.
	 */
	self.registerWithSocket = function(socket) {
		// only register with BID
		_socket = socket;
		_socket.registerOnMessage("BID", self.onBid);
		_socket.registerOnMessage("ASK", self.onAsk);
	}

}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, Market);
	}
});
