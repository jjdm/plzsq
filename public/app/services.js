angular.module("plzsq.services", ["ngCookies"])
	.factory("urlService", ["$location", "$cookies", function ($location, $cookies) {
		return {
			getUser: function() { return $cookies.get("plzsq.user"); },
			getPort: function() { return $location.port(); },
			getHost: function() { return $location.host(); },
			getWsUrl: function() { return 'ws://' + this.getHost() + ':' + this.getPort() + '/?user=' + this.getUser(); }
		};
	}])
	.factory("socketService", ["$rootScope", "$log", "urlService", function ($rootScope, $log, urlService) {
		// get the port and user from the url
		$log.log("Connecting to: " + urlService.getWsUrl());
		var ws = new WebSocket(urlService.getWsUrl());
		return {};
	}])
	.factory('tradeService', ['socketService', '$log', function (socketService, $log) {
		return {};
	}])
;
