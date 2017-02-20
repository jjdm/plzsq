"use strict";
const utils = require('./utils');
const log = utils.logger;

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.History";

/**
 * Provides the service to save and retrieve history items.
 */
const History = function () {
	let self = this;
	log.info("Private History constructor called.");
	let idGenerator = 1;
	let _history = [];
	self.reset = function() {
		idGenerator = 1;
		_history = [];
	};
	self.unique = function() {
		return { globalId: idGenerator++, timestamp: new Date() };
	};
	self.addHistory = function(csvColumns, logString, unique = self.unique()) {
		_history.push({ unique: unique, csvColumns: csvColumns, logString: logString });
	};
	self.getHistory = function() {
		return _history.sort(function(a, b) {
			return a.unique.globalId - b.unique.globalId;
		});
	};
}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, History);
	}
});
