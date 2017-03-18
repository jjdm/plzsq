angular.module('plzsq.services', ['ngCookies'])
	.factory('urlService', ['$location', '$cookies', function ($location, $cookies) {
		return {
			getUser: function() { return $cookies.get('plzsq.user'); },
			getPort: function() { return $location.port(); },
			getHost: function() { return $location.host(); },
			getWsUrl: function() { return 'ws://' + this.getHost() + ':' + this.getPort() + '/?user=' + this.getUser(); }
		};
	}])
	.factory('socketService', ['$rootScope', '$log', 'urlService', function ($rootScope, $log, urlService) {
		// get the port and user from the url
		var ws = new WebSocket(urlService.getWsUrl());
		ws.binaryType = 'arraybuffer';
		ws.onopen = function open() {
			$log.debug('Connected to: ' + urlService.getWsUrl());
		};
		ws.onmessage = function receive(message) {
			$log.debug(message);
			$log.debug(JSON.parse(message.data));
		};
		return {
			sendFile: function(file) {
				$log.debug('Sending File');
				ws.send(file);
			},
			getUser: function() { return urlService.getUser(); }
		};
	}])
	.factory('tradeService', ['socketService', '$log', function (socketService, $log) {
		return {
			bids: [{user: 'a1', amount: 100}, {user:'a7', amount: 220}, {user:'a2', amount: 240}, {user:'a7', amount: 275}],
			asks: [{user:'a3', amount: 350}, {user:'a4', amount: 300}, {user:'a5', amount: 400}, {user:'a10', amount: 325}],
			trades: [{user:'a3', amount: 210}, {user:'a4', amount: 250}, {user:'a5', amount: 390}, {user:'a10', amount: 370}],
			addBid: function(bid) { this.bids.push({ user: socketService.getUser(), amount: bid }); $log.debug('New bid'); }
		};
	}])
;
