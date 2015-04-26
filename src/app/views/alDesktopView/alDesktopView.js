/**
 * Desktop view
 */
'use strict';

var angular = require('angular');
var alDesktopViewTemplate = require('./alDesktopView.html');

var desktopView = angular.module('al.angularExample.views.alDesktopView', []);

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
	$scope
	) {

});

module.exports = desktopView;

