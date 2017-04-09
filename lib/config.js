"use strict";
const yaml = require('js-yaml');
const fs = require('fs');
const utils = require('./utils');
const log = utils.logger;

const CONFIGURATION_KEY = "io.jjdm.chapman.plzsq.Configuration";

const Configuration = function () {

	log.info("Private Configuration constructor called.");

	let self = this;
	let _socket;
	let _data;

	self.loadFile = function(yamlFile) {
		try {
			self.reset();;
			_data = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
			log.debug("New Configuration Loaded: %j", _data);
		} catch (e) {
			log.warn(e);
		}
	};

	self.load = function(yamlString) {
		try {
			self.reset();
			_data = yaml.safeLoad(yamlString);
			log.debug("New Configuration Loaded: %j", _data);
		} catch (e) {
			log.warn(e);
		}
	};

	self.onFileMessage = function configOnFileMessage(user, payload) {
		// TODO JJDM Need to handle configuration errors
		self.load(payload.file);
		_socket.send(user, { type: 'UPLOAD_FILE', message: 'Uploaded successfully.' });
		_socket.broadcast({ type: 'CONFIGURATION', data: _data });
	};

	self.get = function() {
		return _data;
	};

	self.reset = function() {
		_data = undefined;
	}

	self.isLoaded = function() {
		return _data !== undefined && _data !== null;
	}

	self.registerWithSocket = function(socket) {
		_socket = socket;
		_socket.registerOnMessage("UPLOAD_FILE", self.onFileMessage);
	};

}

exports = module.exports = Object.freeze({
	instance: function() {
		return utils.singleton(CONFIGURATION_KEY, Configuration);
	}
});
