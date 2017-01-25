angular.module("plazaSq.controllers", [])
	.controller("TradeController", ["$scope", "TradeService", function ($scope, tradeService) {
		
		$scope.status = {};
		$scope.bids = [];
		$scope.bestBid = {user: 'a1', amount: 110};
		$scope.asks = [];
		$scope.bestAsk = {user: 'a7', amount: 220};
		$scope.trades = [];
		
		$scope.username = null;
		$scope.myBids = [];
		$scope.myAsks = [];
		$scope.bidAmount = null;
		$scope.askAmount = null;
		$scope.lastMessage = null;
		
		$scope.bid = function() {
			tradeService.bid({bid: $scope.bidAmount});
			$scope.lastMessage = "Received bid for: " + $scope.bidAmount;
			$scope.bidAmount = null;
		};
		
		tradeService.connect("/stomp")
			.then(
				function(username) {
					$scope.username = username;
				},
				function(error) {
					$scope.lastMessage = "Error Received: " + error;
				}
			)
		;
			
		
		
	}])
;