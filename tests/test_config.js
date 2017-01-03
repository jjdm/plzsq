"use strict";
var chai = require('chai');
var expect = chai.expect;
var config = require('./../models/config').instance();
var log = require('./../models/utils').logger

log.info("Message in test_config.", { foo: 'bar' })

describe('test_config', function() {
	it('test_config_initial_instance', function() {
		expect(config.get()).to.eql({});
	}),
	it('test_config_singleton', function() {
		var c1 = require('./../models/config').instance();
		var c2 = require('./../models/CONFIG').instance();
		c1.name = "NAME 1";
		expect(c2.name).to.eql(c1.name);
	}),
	it('test_config_yaml', function() {
		config.load('./tests/BasicTest.yml')
		var data = config.get()
		expect(data.maxPrice).to.equal(600);
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.states['X'].value).to.equal(50);
	})
});