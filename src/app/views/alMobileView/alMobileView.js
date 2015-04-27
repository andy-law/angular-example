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

/**
 * @ngdoc directive
 * @name al.angularExample.views.alMobileView:alMobileView
 * @restrict E
 * @scope
 *
 * @description
 * Main view for mobile. Attach HTML template and listen to callbacks from child components
 *
 * @example
 * <doc:example module="al.angularExample.views.alMobileView.alMobileView">
 	<doc:source>
 		<div></div>
 		<style></style>
 		<script></script>
 	</doc:source>
 </doc:example>
 */
mobileView.directive('alMobileView', function() {
	return {
		restrict: 'E',
		controller: 'alMobileViewCtrl',
		template: alMobileViewTemplate,
		replace: true,
		link: function(scope, elem, attrs, ctrl) {

			scope.pusherConnected = false;

			/**
			 * User has input code into alMobileIntro component. Ask controller to send off, and if successful, set to connected to display alMobileInteractive component
			 * @param data
			 */
			scope.onCodeSendRequested = function(connectionCode) {
				//TODO: Set to loading state to stop client from sending multiple codes
				ctrl.connectToPusher(connectionCode).then(function() {
					scope.clientConnected = true;
				}, function(message) {
					scope.clientConnected = false;
					scope.connectionError = message;
				});
			};

			/**
			 * A ball has been 'thrown/flicked' in the alMobileInteractive component. Request controller to send message to pusher with relevant data
			 * @param data
			 */
			scope.onSendBallRequested = function(data) {
				ctrl.onSendBallMessage(data);
			};
		}
	}
});

/**
 * @ngdoc object
 * @name al.angularExample.views.al:alMobileViewCtrl
 * @function
 *
 * @description
 * Controller for mobile view.
 * Connect to pusher service.
 * Listen to messages sent from other client
 */
mobileView.controller('alMobileViewCtrl', function(
	$scope,
	$q,
	$timeout,
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

	/**
	 * Connection to pusher service successfully complete
	 * @param event
	 */
	function onPusherConnected(event) {
		$scope.$apply(function() {
			$scope.pusherConnected = true;
		});
	}

	/**
	 * Error on connecting to pusher service
	 * @param event
	 */
	function onPusherConnectError(event) {
		$scope.pusherConnected = false;
		$scope.pusherErrorMessage = 'Sorry, currently unable to connect to server.';
	}

	/**
	 * Send connection code out to other clients connected to pusher, if matched then resolve promise
	 * @param connectionCode
	 * @returns {promise|*|promise|promise|Function|promise}
	 */
	function connectToPusher(connectionCode) {
		var deferred = $q.defer();

		var timeout = $timeout(function() {
			deferred.reject('Unable to find other client with that code, please check and try again');
		}, 3000);

		pusher.channel.bind(PUSHER_CODE_MATCHED, function(event) {
			$timeout.cancel(timeout);
			deferred.resolve();
			$scope.connectionCode = connectionCode;
		});

		AlPusherService.sendMessage(PUSHER_SEND_CODE, {code: connectionCode});

		return deferred.promise;
	}

	this.connectToPusher = function(connectionCode) {
		return connectToPusher(connectionCode);
	};

	/**
	 * User has flicked a ball at the screen, tell the pusher service to send out message to connected clients
	 * @param data
	 */
	this.onSendBallMessage = function(data) {
		AlPusherService.sendMessage(PUSHER_REQUEST_BALL_SEND, {params: data, code: $scope.connectionCode});
	};

});

module.exports = mobileView;

