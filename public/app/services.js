angular.module("plazaSq.services", [])
	.factory("WebSocketClient", ["$q", function ($q) {
		var ws;
		var webSocketClient = {
			init: function (user, port) {
				ws = 'ws://localhost:' + port + '/?user=' + user;
			},
			connect: function () {
				return $q(function (resolve, reject) {
					if (!stompClient) {
						reject("STOMP client not created");
					} else {
						stompClient.connect({}, function (frame) {
							resolve(frame);
						}, function (error) {
							reject("STOMP protocol error " + error);
						});
					}
				});
			},
			disconnect: function () {
				stompClient.disconnect();
			},
			subscribe: function (destination) {
				var deferred = $q.defer();
				if (!stompClient) {
					deferred.reject("STOMP client not created");
				} else {
					stompClient.subscribe(destination, function (message) {
						deferred.notify(JSON.parse(message.body));
					});
				}
				return deferred.promise;
			},
			query: function (destination) {
				return $q(function (resolve, reject) {
					if (!stompClient) {
						reject("STOMP client not created");
					} else {
						stompClient.subscribe(destination, function (message) {
							resolve(JSON.parse(message.body));
						});
					}
				});
			},
			send: function (destination, headers, object) {
				stompClient.send(destination, headers, object);
			}
		};
		return webSocketClient;
	}])
	.factory('TradeService', ['StompClient', '$q', function (stompClient, $q) {
		return {
			connect: function (url) {
				stompClient.init(url);
				return stompClient.connect().then(function (frame) {
					return frame.headers['user-name'];
				});
			},
			disconnect: function () {
				stompClient.disconnect();
			},
			loadStatus: function () {
				return stompClient.query("/submit/status");
			},
			fetchMarketStream: function () {
				return stompClient.subscribe("/topic/market");
			},
			fetchErrorStream: function () {
				return stompClient.subscribe("/user/queue/errors");
			},
			submitAction: function(data, action) {
				data.action = action;
				return stompClient.send("/submit/action", {}, JSON.stringify(data));
			},
			bid: function(data) {
				data.action = "bid";
				return stompClient.send("/submit/action", {}, JSON.stringify(data));
			},
			ask: function (data) { submitAction(data, "ask") },
			buy: function (data) { submitAction(data, "buy") },
			sell: function (data) { submitAction(data, "sell") },
			cancel: function (data) { submitAction(data, "cancel") }
		};
	}])
;
