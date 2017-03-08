angular.module("plzsq.controllers", [])
	.controller("marketController", ["$scope", "$log", "tradeService", function ($scope, $log, tradeService) {
		$scope.name = "Josh";
		$scope.bid = null;
		$scope.ask = null;
		$scope.buy = 300;
		$scope.sell = 150;
		$scope.messages = ["one", "two", "three"];
		$scope.placeBid = function() {
			$log.debug("Bid placed for " + $scope.bid);
			$scope.bid = null;
		};
	}])
;
