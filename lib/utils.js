"use strict";
const winston = require('winston');
require('winston-daily-rotate-file');

exports = module.exports = {

	singleton: function(key, constructor) {
		const SYMBOL_KEY = Symbol.for(key);
		let hasSymbol = Object.getOwnPropertySymbols(global).indexOf(SYMBOL_KEY) > -1;
		if(hasSymbol) {
			return global[SYMBOL_KEY];
		} else {
			let singleton = new constructor();
			global[SYMBOL_KEY] = singleton;
			return singleton;
		}
	},

	sleep: function (milliseconds) {
		let start = new Date().getTime();
		for (let i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) >= milliseconds) {
				break;
			}
		}
	},

	logger: new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({ json: false, timestamp: true, colorize: 'all', level: 'error' }),
			new winston.transports.DailyRotateFile({
				filename: __dirname + '/../logs/debug.log',
				datePattern: 'yyyy-MM-dd.',
				prepend: true,
				json: false,
				level: 'debug'
			})
		],
		exceptionHandlers: [
			new winston.transports.DailyRotateFile({
				filename: __dirname + '/../logs/exceptions.log',
				humanReadableUnhandledException: true,
				datePattern: 'yyyy-MM-dd.',
				prepend: true,
				json: false
			})
		],
		exitOnError: false
	})

};
