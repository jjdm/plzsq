"use strict";
const chai = require('chai');
const expect = chai.expect;
const config = require('./../common/config').instance();
const log = require('./../common/utils').logger

log.info("Message in test_config.", { foo: 'bar' })

describe('test_config', function() {
	it('test_config_initial_instance', function() {
		expect(config.get()).to.eql({});
	}),
	it('test_config_singleton', function() {
		let c1 = require('./../common/config').instance();
		let c2 = require('./../common/CONFIG').instance();
		c1.name = "NAME 1";
		expect(c2.name).to.eql(c1.name);
	}),
	it('test_config_yaml', function() {
		config.load('./test/BasicTest.yml')
		let data = config.get()
		expect(data.maxPrice).to.equal(600);
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.states['X'].value).to.equal(50);
	})
});
