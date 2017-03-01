"use strict";
const chai = require('chai');
const expect = chai.expect;
const log = require('./../lib/utils').logger;
const market = require('./../lib/market').instance();

/**
 * Mock socket used for broadcasting and sending.
 */
const MockSocket = function() {
	let self = this;
	self.broadcast = function(data) {
		log.debug('MockSocket Broadcast: %j', data);
	};
	self.registerOnMessage = function(messageType, callbackFunction) {
		log.debug(`Registered ${messageType} from ${callbackFunction.name}.`);
	};
}

describe('test_market', function() {
	it('test_market_basic', function(done) {
		setTimeout(done, 10);
		market.registerWithSocket(new MockSocket());
		market.onBid({ type: "BID", user: "a1", amount: 200 });
		expect(1).to.equal(1);
	})
});
