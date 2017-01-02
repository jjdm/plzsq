"use strict";
var yaml = require('js-yaml');
var fs = require('fs');
var utils = require('./utils')

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Configuration";

var constructor = function Configuration() {
	console.log("Private Configuration constructor called.");
	var _data = {};
	this.load = function(yamlFile) {
		try {
			_data = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
		} catch (e) {
			console.warn(e);
		}
	};
	this.get = function() {
		return _data;
	};
}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, constructor);
	}
});
