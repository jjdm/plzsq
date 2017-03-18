"use strict";
const utils = require('./utils');
const log = utils.logger;
const config = require('./config').instance();
const history = require('./history').instance();

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Market";

/**
 * A trader for a given round.
 * @param id The user ID (e.g. a1);
 */
const Trader = function(id) {
	return {
		id: id,
		display: null,
		cash: null,
		coupons: null,
		score: null,
		clues: null,
		participating: null,
		cluesToReceive: null,
		participationCash: null
	};
}

/**
 * Represents a bid or ask with a specific amount.
 * @param type The type of order (e.g. BID, ASK, BUY, SELL)
 * @param user The user ID (e.g. a1)
 * @param amount Optional if market order (e.g. BUY, SELL).
 */
const Order = function(type, user, amount) {
	return { unique: history.unique(), type: type, user: user, amount: amount };
}

/**
 * The cancellation of an order.
 * @param order The cancelled order.
 */
const Cancellation = function(order) {
	return { unique: history.unique(), order: order };
}

/**
 * A market trade.
 * @param amount The amount of the trade.
 * @param buyOrder The original buy/bid order of the trade.
 * @param sellOrder The original sell/ask order of the trade.
 */
const Trade = function(amount, buyOrder, sellOrder) {
	return { unique: history.unique(), order: order };
}

/**
 * Represents the data for a given round.
 * @param id The round ID (e.g. 1 for Round 1).
 */
const Round = function(id) {
	let self = this;
	self.id = id;
	self.traders = [];
	self.bids = [];
	self.asks = [];
	self.trades = [];
	self.cancellations = [];
}

const Market = function () {

	log.info("Private Market constructor called.");

	let self = this;
	let _socket = null;
	let _config = config.get();
	let _currentRoundId = 0;
	let _currentRound = null;
	let _rounds = [];
	let _history = [];

	/**
	 * Called when a new configuration is uploaded.
	 */
	self.reset = function() {
		// _socket remains the same
		_config = config.get();
		_currentRoundId = 0;
		_currentRound = null;
		_rounds = [];
		_history = [];
	};

	/**
	 * Called a new ask is received.
	 */
	self.onAsk = function marketOnAsk(user, ask) {
		log.debug("Received ask: %j", ask);
		_socket.broadcast(ask);
	}

	/**
	 * Called a new bid is received.
	 */
	self.onBid = function marketOnBid(user, bid) {
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
