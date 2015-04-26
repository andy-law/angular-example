/**
 * Desktop view
 */
'use strict';

var angular = require('angular');
var alDesktopViewTemplate = require('./alDesktopView.html');

var alPusherService = require('../../services/alPusherService');
var alDesktopInteractive = require('../../components/alDesktopInteractive/alDesktopInteractive')

var desktopView = angular.module('al.angularExample.views.alDesktopView', [
	alPusherService.name,
	alDesktopInteractive.name
]);

desktopView.constant('NEW_BALL_REQUESTED', 'NEW_BALL_REQUESTED');

desktopView.directive('alDesktopView', function(
	$document
	) {
	return {
		restrict: 'E',
		controller: 'alDesktopViewCtrl',
		template: alDesktopViewTemplate,
		replace: true,
		link: function(scope, elem, attrs) {

			function _getRandomChar(charCount) {
				var possibleChar = 'abcdefghijklmnopqrstuvwxyz',
					charCount = charCount || 1,
					chars = '',
					char,
					i = 0;

				for(i=0; i<charCount; i++) {
					char = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
					//    char = Math.random() > 0.5 ? char.toUpperCase() : char;
					chars += char;
				}

				return chars;
			}

			var date = new Date();

			scope.connectionUrl = $document[0].head.baseURI;
			scope.connectionCode = _getRandomChar() + date.getMilliseconds() + _getRandomChar(2);

		}
	}
});

desktopView.controller('alDesktopViewCtrl', function(
	$scope,
	AlPusherService,
	PUSHER_CONNECTED,
	PUSHER_CONNECTION_ERROR,
	PUSHER_SEND_CODE,
	PUSHER_CODE_MATCHED,
	PUSHER_REQUEST_BALL_SEND,
	NEW_BALL_REQUESTED
	) {

	var pusher = AlPusherService.getPusher();

	pusher.channel.bind(PUSHER_CONNECTED, onChannelSubscriptionSuccess);
	pusher.channel.bind(PUSHER_CONNECTION_ERROR, onChannelSubscriptionError);

	pusher.channel.bind(PUSHER_SEND_CODE, onPusherCodeReceived);
	pusher.channel.bind(PUSHER_CODE_MATCHED, onClientCodeMatched);
	pusher.channel.bind(PUSHER_REQUEST_BALL_SEND, onBallSendRequested);

	function onChannelSubscriptionSuccess(event) {
		//TODO: Implement success
	}

	function onChannelSubscriptionError(event) {
		//TODO: Implement error
	}

	function onPusherCodeReceived(data) {
		if(data.code === $scope.connectionCode) {
			$scope.$apply(function() {
				$scope.connected = true;
			});
			AlPusherService.sendMessage(PUSHER_CODE_MATCHED, {});
		}
	}

	function onClientCodeMatched(event) {
		//TODO: Implement client code matched
	}

	function onBallSendRequested(data) {
		if(data.code !== $scope.connectionCode) {
			return;
		}
		$scope.$broadcast(NEW_BALL_REQUESTED, data.params);
	}

});

module.exports = desktopView;

