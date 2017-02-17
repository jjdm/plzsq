"use strict";
const yaml = require('js-yaml');
const fs = require('fs');
const utils = require('./utils');
const log = utils.logger;

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Configuration";

const Configuration = function () {
	log.info("Private Configuration constructor called.");
	let _data = {};
	this.load = function(yamlFile) {
		try {
			_data = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
		} catch (e) {
			log.warn(e);
		}
	};
	this.get = function() {
		return _data;
	};
}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, Configuration);
	}
});
