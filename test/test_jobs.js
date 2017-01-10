"use strict";
const chai = require('chai');
const expect = chai.expect;
const utils = require('./../models/utils');
const log = utils.logger;
const jobs = require('./../models/jobs').instance();

describe('test_jobs', function() {
	it('test_jobs_delay', function(done) {
		// need to check the log for this one
		setTimeout(done, 25);
		jobs.delay(function(name) {
			log.debug("Hello " + name);
		}, 10, "Josh");
		log.debug("Done with test_jobs_delay");
	}),
	it('test_jobs_schedule', function(done) {
		// need to check the log for this one
		setTimeout(done, 75);
		let i = 0;
		jobs.schedule(function(name) {
			log.debug("Hello " + name);
		}, 25, i++);
		log.debug("Done with test_jobs_schedule");
	})
});
