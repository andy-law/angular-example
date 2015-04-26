/**
 * Mobile view
 */
'use strict';

var angular = require('angular');
var alMobileViewTemplate = require('./alMobileView.html');

var mobileView = angular.module('al.angularExample.views.alMobileView', []);

mobileView.directive('alMobileView', function() {
	return {
		restrict: 'E',
		controller: 'alMobileViewCtrl',
		template: alMobileViewTemplate,
		replace: true,
		link: function(scope, elem, attrs) {

		}
	}
});

mobileView.controller('alMobileViewCtrl', function(
	$scope
	) {



});

module.exports = mobileView;

