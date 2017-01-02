"use strict";

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
	}
	
};