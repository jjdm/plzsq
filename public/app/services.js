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

		var _registered = [];
		var _user = urlService.getUser();

		var _ws = new WebSocket(urlService.getWsUrl());
		_ws.binaryType = 'arraybuffer';
		_ws.onopen = function open() {
			$log.debug('Connected to: ' + urlService.getWsUrl());
		};
		_ws.onmessage = function receive(message) {
			handleMessage(_user, message);
		};
		var handleMessage = function(user, message) {
			var payload = JSON.parse(message.data);
			$log.debug("Message Received in handleMessage: %j", payload);
			var match = false;
			_registered.forEach(function(r) {
				if(r.type === payload.type) {
					r.handler(user, payload);
					match = true;
				}
			});
			if(!match) {
				$log.error('Could not match for message type %s', payload.type);
			}
		};

		return {
			sendFile: function(file) {
				$log.debug('Sending File: ', file.name);
				_ws.send(file);
			},
			send: function(type, data) {
				var message = data;
				message.type = type;
				message.user = user;
				_ws.send(JSON.stringify(message));
			},
			getUser: function() {
				return urlService.getUser();
			},
			registerOnMessage: function(messageType, callbackFunction) {
				_registered.push({type: messageType, handler: callbackFunction});
				$log.debug('Registered %s from %s.', messageType, callbackFunction.name);
			}
		};

	}])
	.factory('tradeService', ['socketService', '$log', function (socketService, $log) {

		var _configuration = null;
		var _bids = [{user: 'a1', amount: 100}, {user:'a7', amount: 220}, {user:'a2', amount: 240}, {user:'a7', amount: 275}];
		var _asks = [{user:'a3', amount: 350}, {user:'a4', amount: 300}, {user:'a5', amount: 400}, {user:'a10', amount: 325}];
		var _trades = [{user:'a3', amount: 210}, {user:'a4', amount: 250}, {user:'a5', amount: 390}, {user:'a10', amount: 370}];

		var _onConfiguration = function tradeServiceOnConfiguration(user, message) {
			_configuration = message.data;
			$log.debug("tradeService.tradeServiceOnConfiguration: %j", _configuration);
		};

		socketService.registerOnMessage("CONFIGURATION", _onConfiguration);

		return {
			bids: _bids,
			asks: _asks,
			trades: _trades,
			addBid: function(bid) { _bids.push({ user: socketService.getUser(), amount: bid }); $log.debug('New bid'); }
		};

	}])
;
