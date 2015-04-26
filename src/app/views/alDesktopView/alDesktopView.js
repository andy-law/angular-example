/**
 * Desktop view
 */
'use strict';

var angular = require('angular');
var alDesktopViewTemplate = require('./alDesktopView.html');

var alPusherService = require('../../services/alPusherService');

var desktopView = angular.module('al.angularExample.views.alDesktopView', [
	alPusherService.name
]);

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
	PUSHER_CODE_MATCHED
	) {

	var pusher = AlPusherService.getPusher();

	pusher.channel.bind(PUSHER_CONNECTED, channelSubscriptionSuccess);
	pusher.channel.bind(PUSHER_CONNECTION_ERROR, channelSubscriptionError);

	pusher.channel.bind(PUSHER_SEND_CODE, function(data) {
		if(data.code === $scope.connectionCode) {
			$scope.$apply(function() {
				$scope.connected = true;
			});
			AlPusherService.sendMessage(PUSHER_CODE_MATCHED, {});
		}
	});
	pusher.channel.bind(PUSHER_CODE_MATCHED, clientCodeMatched);

	function channelSubscriptionSuccess(event) {
		//TODO: Implement success
	}

	function channelSubscriptionError(event) {
		//TODO: Implement error
	}

	function clientCodeMatched(event) {
		//TODO: Implement client code matched
	}

});

module.exports = desktopView;

