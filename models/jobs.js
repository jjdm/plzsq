"use strict";
const utils = require('./utils')
const log = utils.logger

const JOBS_KEY = "io.jjdm.chapman.plzsq.Jobs";

const constructor = function Jobs() {
	log.debug("Private Jobs constructor called.");
	let _jobs = [];
	this.delay = function(callback, delay, ...args) {
		let timeout = setTimeout(callback, delay, args);
		_jobs.push({ type: "timeout", job: timeout});
	};
	this.schedule = function(callback, delay, ...args) {
		let timeout = setInterval(callback, delay, args);
		_jobs.push({ type: "interval", job: timeout});
	};
	this.clear = function() {
		jobs.forEach(function(j) {
			if(j.type == "timeout") {
				clearTimeout(j.job);
			} else if(j.type == "interval") {
				clearInterval(j.job);
			} else {
				log.warn("Unknown job type: " + j.type);
			}
		});
	};
}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(JOBS_KEY, constructor);
	}
});
