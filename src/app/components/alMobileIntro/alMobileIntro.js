/**
 * Introductory page on mobile
 */

var angular = require('angular');

var alMobileIntroTemplate = require('./alMobileIntro.html');

var alMobileIntro = angular.module('al.angularExample.components.alMobileIntro', []);

alMobileIntro.directive('alMobileIntro', function() {
	return {
		restrict: 'E',
		controller: 'alMobileIntroCtrl',
		template: alMobileIntroTemplate,
		replace: true,
		scope: {
			connectionError: '=?',
			onCodeSendRequested: '&'
		},
		link: function(scope, elem, attrs, ctrl) {

			scope.onSubmitClicked = function(event) {

				if(!scope.connectionCode) {
					return;
				}
				scope.onCodeSendRequested({$data: scope.connectionCode});

			};

		}
	}
});

alMobileIntro.controller('alMobileIntroCtrl', function($scope) {

});


module.exports = alMobileIntro;