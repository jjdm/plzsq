"use strict";
const chai = require('chai');
const expect = chai.expect;
const config = require('./../lib/config').instance();
const log = require('./../lib/utils').logger;

log.info("Message in test_config.", { foo: 'bar' })

describe('test_config', function() {
	it('test_config_initial_instance', function() {
		expect(config.get()).to.be.undefined;
	}),
	it('test_config_singleton', function() {
		let c1 = require('./../lib/config').instance();
		let c2 = require('./../lib/CONFIG').instance();
		c1.name = "NAME 1";
		expect(c2.name).to.eql(c1.name);
	}),
	it('test_config_reset', function() {
		config.reset();
		expect(config.isLoaded()).to.be.false;
		config.loadFile('./test/BasicTest.yml');
		expect(config.isLoaded()).to.be.true;
	}),
	it('test_config_yaml', function() {
		config.loadFile('./test/BasicTest.yml')
		let data = config.get()
		expect(data.maxPrice).to.equal(600);
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.labels.shares).to.equal('Certificate');
		expect(data.states['X'].value).to.equal(50);
	}),
	it('test_config_yaml_load_direct', function() {
		config.load('name: josh\nthings: [1, 2, 7]')
		let data = config.get()
		expect(data.name).to.equal('josh');
		expect(data.things[1]).to.equal(2);
		expect(data.things[2]).to.equal(7);
	})
});
