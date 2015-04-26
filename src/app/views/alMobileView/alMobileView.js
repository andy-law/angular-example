/**
 * Mobile view
 */
'use strict';

var angular = require('angular');
var alMobileViewTemplate = require('./alMobileView.html');

var alPusherService = require('../../services/alPusherService');
var alMobileIntro = require('../../components/alMobileIntro/alMobileIntro');
var alMobileInteractive = require('../../components/alMobileInteractive/alMobileInteractive');

var mobileView = angular.module('al.angularExample.views.alMobileView', [
	alPusherService.name,
	alMobileIntro.name,
	alMobileInteractive.name
]);

mobileView.directive('alMobileView', function() {
	return {
		restrict: 'E',
		controller: 'alMobileViewCtrl',
		template: alMobileViewTemplate,
		replace: true,
		scope: {

		},
		link: function(scope, elem, attrs, ctrl) {



		}
	}
});

mobileView.controller('alMobileViewCtrl', function(
	$scope,
	$q,
	AlPusherService,
	PUSHER_CONNECTED,
	PUSHER_CONNECTION_ERROR,
	PUSHER_SEND_CODE,
	PUSHER_CODE_MATCHED,
	PUSHER_REQUEST_BALL_SEND
	) {

	//TODO: Loading status whilst waiting to connect
	var pusher = AlPusherService.getPusher();
	pusher.channel.bind(PUSHER_CONNECTED, onPusherConnected);
	pusher.channel.bind(PUSHER_CONNECTION_ERROR, onPusherConnectError);

	function onPusherConnected(event) {
		//TODO: new status when loaded
	}

	function onPusherConnectError(event) {
		//TODO
	}

	function connectToPusher(connectionCode) {
		var deferred = $q.defer();

		pusher.channel.bind(PUSHER_CODE_MATCHED, function(event) {
			deferred.resolve();
			scope.connectionCode = connectionCode;
		});

		AlPusherService.sendMessage(PUSHER_SEND_CODE, {code: connectionCode});

		return deferred.promise;
	};

	$scope.onCodeSendRequested = function(data) {
		//TODO: Set to loading state
		connectToPusher(data).then(function() {
			$scope.connected = true;
		}, function() {
			$scope.connected = false;
			$scope.connectionError = 'Unable to connect at the moment. Please try again later.';
		});
	};

	$scope.onSendBallRequested = function(data) {
		AlPusherService.sendMessage(PUSHER_REQUEST_BALL_SEND, {params: data, code: $scope.connectionCode});
	};

});

module.exports = mobileView;

