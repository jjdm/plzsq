"use strict";
const chai = require('chai');
const expect = chai.expect;
const utils = require('./../lib/utils');
const log = utils.logger;

describe('test_utils', function() {
	it('test_utils_singleton', function() {
		let u1 = require('./../lib/utils');
		let u2 = require('./../lib/UTILS');
		let c1 = u1.singleton("some.test.key", function Config() { this.name = "NAME1"; });
		let c2 = u2.singleton("some.test.key", function Config() { this.name = "NAME2"; });
		expect(c2.name).to.eql(c1.name);
	}),
	it('test_utils_sleep', function() {
		log.debug("Before sleep");
		utils.sleep(25);
		log.debug("After sleep");
	}),
	it('test_utils_sort', function() {
		let items = [1, 13, 7, 3, 9];
		let sorted = items.sort(function(a, b) {
			return b - a;
		});
		log.debug(`items: ${items}`);
		log.debug(`items: ${items.sort()}`);
		log.debug(`items: ${items}`);
	})
});
