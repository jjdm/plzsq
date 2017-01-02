"use strict";
var chai = require('chai');
var expect = chai.expect;

describe('test_utils', function() {
	it('test_singleton', function() {
		var u1 = require('./../models/utils');
		var u2 = require('./../models/UTILS');
		var c1 = u1.singleton("some.test.key", function Config() { this.name = "NAME1"; });
		var c2 = u2.singleton("some.test.key", function Config() { this.name = "NAME2"; });
		expect(c2.name).to.eql(c1.name);
	})
});




