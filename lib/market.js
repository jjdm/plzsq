"use strict";
const utils = require('./utils');
const log = utils.logger;
const config = require('./config');

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Market";

const Round = function() {

}

const Market = function () {

	log.info("Private Market constructor called.");

	let _config = config.get();
	let _currentRoundPointer = 0;
	let _rounds = [];

	this.reset = function() {
		_config = config.get();
		_currentRoundPointer = 0;
		_rounds = [];
	};

	this.get = function() {
		return _data;
	};
	
}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, Market);
	}
});
