"use strict";
var winston = require('winston');
require('winston-daily-rotate-file');

exports = module.exports = {
	
	singleton: function(key, constructor) {
		const SYMBOL_KEY = Symbol.for(key);
		var hasSymbol = Object.getOwnPropertySymbols(global).indexOf(SYMBOL_KEY) > -1;
		if(hasSymbol) {
			return global[SYMBOL_KEY];
		} else {
			var singleton = new constructor();
			global[SYMBOL_KEY] = singleton;
			return singleton;
		}
	},
	
	logger: new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({ json: false, timestamp: true, colorize: 'all', level: 'error' }),
			new winston.transports.DailyRotateFile({
				filename: __dirname + '/debug.log',
				datePattern: 'yyyy-MM-dd.',
				prepend: true,
				json: false,
				level: 'debug'
			})
		],
		exceptionHandlers: [
			new winston.transports.DailyRotateFile({
				filename: __dirname + '/exceptions.log',
				datePattern: 'yyyy-MM-dd.',
				prepend: true,
				json: false
			})
		],
		exitOnError: false
	})
	
};