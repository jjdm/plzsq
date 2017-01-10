"use strict";
const chai = require('chai');
const expect = chai.expect;
const utils = require('./../models/utils');
const log = utils.logger;
const jobs = require('./../models/jobs').instance();

describe('test_jobs', function() {
	it('test_jobs_basic', function() {
		jobs.delay(function(name) {
			log.debug("Hello " + name);
		}, 50, "Josh");
		utils.sleep(60);
	})
});
