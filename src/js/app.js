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

var alAngularExampleTemplate = require('./app.html');

angular.element(document).ready(function() {

	var app = angular.module(appName, [
		'ngRoute',
		'ngAnimate',
		'ngSanitize',
		'ui.router'
	]);

	app.run(function(
		$rootScope,
		$state) {

	});

	app.directive('alAngularExample', function() {
		return {
			restrict: 'E',
			controller: 'alAngularExampleCtrl',
			template: alAngularExampleTemplate,
			replace: true,
			link: function(scope, elem, attrs) {
				
			}
		};
	});

	app.controller('alAngularExampleCtrl', function($scope) {

	});

	angular.bootstrap($('[data-app-name="al-angular-example"]'), [appName]);

});