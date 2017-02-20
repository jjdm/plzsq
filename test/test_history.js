"use strict";
const chai = require('chai');
const expect = chai.expect;
const log = require('./../lib/utils').logger;
let history = require('./../lib/history').instance();

describe('test_history', function() {
	it('test_history_unique', function(done) {
		setTimeout(done, 20);
		history.reset();
		let unique = history.unique();
		log.debug(unique);
		expect(unique.globalId).to.equal(1);
		setTimeout(function() {
			expect(unique.timestamp.getTime()).to.be.below(new Date().getTime());
		}, 10);
		expect(history.getHistory().length).to.equal(0);
	}),
	it('test_history_item', function(done) {
		setTimeout(done, 20);
		history.reset();
		let unique = history.unique();
		history.addHistory(['c1', 'c2', 'c3'], "SOME LOG STATEMENT", unique);
		let items = history.getHistory();
		expect(items.length).to.equal(1);
		expect(items[0].unique.globalId).to.equal(1);
		expect(items[0].unique.timestamp.getTime()).to.equal(unique.timestamp.getTime());
		setTimeout(function() {
			history.addHistory(['d1', 'd2', 'd3'], "SOME OTHER LOG STATEMENT");
			items = history.getHistory();
			expect(items.length).to.equal(2);
			expect(items[1].unique.globalId).to.equal(2);
			expect(items[1].unique.timestamp.getTime()).to.be.above(unique.timestamp.getTime());
		}, 10);
	}),
	it('test_history_sorting', function() {
		history.reset();
		let uniques = [];
		for(let i = 0; i < 100; i++) {
			uniques.push(history.unique());
		}
		while(uniques.length > 0) {
			history.addHistory(['c1', 'c2', 'c3'], "SOME LOG STATEMENT", uniques.pop());
		}
		let items = history.getHistory();
		expect(items.length).to.equal(100);
		expect(items[0].unique.globalId).to.equal(1);
		expect(items[99].unique.globalId).to.equal(100);
		expect(items[98].unique.globalId).to.equal(99);
	})

});
