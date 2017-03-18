angular.module('plzsq.controllers', [])
	.controller('loginController', ['$scope', '$log', function ($scope, $log) {
		$scope.userId = null;
		$scope.login = function() {
			$log.debug('Login from ' + $scope.userId);
			window.location.href = './login/' + $scope.userId;
			$scope.userId = null;
		};
	}])
	.directive('configUpload', ['$log', function($log) {
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {
				var id = '#' + attrs.id;
				var button = $('button.config-upload-button', id);
				var display = $('input.config-upload-display', id);
				var file = $('input.config-upload-file', id);
				display.val(file.val());
				button.click(function() { file.click(); });
				file.change(function() {
					var toDisplay = file.val().replace(/.*\\/, ''); // Chrome uses 'fakepath' here.
					display.val(toDisplay);
				});
		    }
		};
	}])
	.controller('adminController', ['$scope', '$log', 'socketService', function ($scope, $log, socketService) {
		var _onFileMessage = function adminControllerOnFileMessage(user, message) {
			$log.debug("adminController.onFileMessage: %j", message);
		}
		$scope.submit = function() {
			let uploadedFile = $('#configUploadFile')[0].files[0];
			if (uploadedFile) {
				// TODO JJDM Need more validation (is yaml, etc.)
				$scope.upload(uploadedFile);
	        }
		};
		$scope.upload = function(file) {
			socketService.sendFile(file);
		};
		socketService.registerOnMessage("UPLOAD_FILE", _onFileMessage);
	}])
	.controller('chartController', ['$scope', '$log', 'tradeService', function ($scope, $log, tradeService) {

		$scope.bids = tradeService.bids;
		$scope.asks = tradeService.asks;
		$scope.trades = tradeService.trades;

		$scope.chart = new CanvasJS.Chart('tradingChart', {
			axisY: { minimum: 0, maximum: 600 },
			axisX: { valueFormatString: ' ' },
			data: [
				{ type: 'line', toolTipContent: 'Trade at {y}', label: ' ', dataPoints: [] },
				{ type: 'scatter', toolTipContent: 'Ask at {y}', label: ' ', dataPoints: [] },
				{ type: 'scatter', toolTipContent: 'Bid at {y}', label: ' ', dataPoints: [] }
			]
		});

		$scope.updateChart = function() {
			var data = $scope.chart.options.data;
			var tradeData = data[0].dataPoints = [];
			var askData = data[1].dataPoints = [];
			var bidData = data[2].dataPoints = [];
			for(var i = 0; i < $scope.trades.length; i++) { tradeData.push({ x: (i + 1), y: $scope.trades[i].amount }) };
			for(var i = 0; i < $scope.asks.length; i++) { askData.push({ x: 30, y: $scope.asks[i].amount }) };
			for(var i = 0; i < $scope.bids.length; i++) { bidData.push({ x: 30, y: $scope.bids[i].amount }) };
			$log.debug(data);
			$scope.chart.render();
		};

		$scope.$watchCollection('bids', function () { $scope.updateChart(); });
		$scope.$watchCollection('asks', function () { $scope.updateChart(); });
		$scope.$watchCollection('trades', function () { $scope.updateChart(); });

	}])
	.controller('marketController', ['$scope', '$log', 'tradeService', function ($scope, $log, tradeService) {
		$scope.bid = null;
		$scope.ask = null;
		$scope.buy = 300;
		$scope.sell = 150;
		$scope.placeBid = function() {
			$log.debug('Bid placed for ' + $scope.bid);
			tradeService.addBid($scope.bid);
			$scope.bid = null;
		};
	}])
;
