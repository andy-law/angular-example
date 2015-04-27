/**
 * Main entry point for application
 */
'use strict';

var appName = 'al.angularExample';

var angular = require('angular');
require('angular-route');
require('angular-ui-router');
require('angular-animate');
require('angular-sanitize');
var $ = require('jquery');

require('browsernizr/test/websockets');
require('browsernizr/test/css/transforms');
require('browsernizr/test/css/transforms3d');
require('browsernizr/test/css/transitions');
require('browsernizr/test/webgl');

var Modernizr = require('browsernizr');

var alDesktopView = require('./views/alDesktopView/alDesktopView');
var alMobileView = require('./views/alMobileView/alMobileView');

var alAngularExampleTemplate = require('./app.html');

angular.element(document).ready(function() {

	var module = angular.module(appName, [
		'ngRoute',
		'ngAnimate',
		'ngSanitize',
		'ui.router',

		alDesktopView.name,
		alMobileView.name
	]);

	module.constant('PUSHER_CONNECTED', 		'pusher:subscription_succeeded');
	module.constant('PUSHER_CONNECTION_ERROR', 	'pusher:subscription_error');
	module.constant('PUSHER_SEND_CODE',			'client-code-send');
	module.constant('PUSHER_CODE_MATCHED',		'client-code-matched');
	module.constant('PUSHER_REQUEST_BALL_SEND',	'client-send-ball');

	module.run(function(
		$rootScope,
		$state) {

	});

	module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

		// Defaults
		$urlRouterProvider
			.when('', '/')
			.otherwise('/404');

		$stateProvider
			.state('mobile', {
				url: '/mobile',
				views: {
					'main': { template: '<al:mobile-view></efn:mobile-view>' }
				}
			});

		$stateProvider
			.state('desktop', {
				url: '/desktop',
				views: {
					'main': { template: '<al:desktop-view></efn:desktop-view>' }
				}
			});

	});

	/**
	 * @ngdoc directive
	 * @name al.angularExample:alAngularExample
	 * @restrict E
	 * @scope
	 *
	 * @description
	 * Main Application entry point
	 *
	 * Detects whether browser is mobile (Android or iOS). Almost certainly not the most robust way to do this, but for sake of example should be fine.
	 * Once it is detected if it's a mobile browser or not, state is updated to either mobile or desktop and relevant view triggered
	 *
	 * @example
	 * <doc:example module="al.angularExample.alAngularExample">
	 	<doc:source>
	 		<div>
	 			<al-angular-example></al-angular-example>
	 		</div>
	 		<style>
	 		</style>
	 		<script>
	 		</script>
	 	</doc:source>
	 </doc:example>
	 */
	module.directive('alAngularExample', function(
		$state
		) {
		return {
			restrict: 'E',
			controller: 'alAngularExampleCtrl',
			template: alAngularExampleTemplate,
			replace: true,
			link: function(scope, elem, attrs) {

				var isMobile = !!(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i));

				if(isMobile) {
					$state.go('mobile');
				} else {
					$state.go('desktop');
				}

			}
		};
	});

	/**
	 * @ngdoc object
	 * @name al.angularExample:alAngularExampleCtrl
	 * @function
	 *
	 * @description
	 * Controller for alAngularExample
	 */
	module.controller('alAngularExampleCtrl', function($scope) {

	});


	angular.bootstrap($('[data-app-name="al-angular-example"]'), [appName]);

});