"use strict";
const chai = require('chai');
const expect = chai.expect;
const loki = require('lokijs');
const utils = require('./../lib/utils');
const log = utils.logger;

describe('test_loki', function() {
	it('test_loki_basic', function() {
		let db = new loki('loki.json');
		let bids = db.addCollection('bids');
		let a1 = bids.insert({ id:'a1', amount: 200 });
		let a2 = bids.insert({ id:'a2', amount: 300 });
		a1 = bids.findOne({ id: 'a1'} );
		a2 = bids.get(a2.$loki);
		a1.amount = 250;
		a2.id = 'a2_2';
		bids.update(a1);
		bids.update(a2);
		log.debug(Object.getOwnPropertyNames(bids.find()));
		log.debug(JSON.stringify(a2));
		expect(a2.meta.created).to.be.below(a2.meta.updated);
		expect(a1.meta.updated).to.be.above(a1.meta.created);
	})
});
