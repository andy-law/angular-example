/**
 * Service to interact with Pusher
 */

var angular = require('angular');

var alPusherService = angular.module('al.angularExample.services.alPusherService', []);

alPusherService.service('AlPusherService', function() {
	var AlPusherService = function() {

		var pusher = new Pusher('143596c14eddb2982ed5', {
			authEndpoint: 'http://default-environment-jkuxcic2df.elasticbeanstalk.com/pusher/auth',
			authTransport: 'jsonp'
		});
		var channel = pusher.subscribe('private-code-sample');

		this.getPusher = function() {
			return {
				pusher: pusher,
				channel: channel
			}
		};

		this.sendMessage = function(type, payload) {
			console.log('send message', type, payload);
			channel.trigger(type, payload);
		};

	}

	return new AlPusherService();
});

module.exports = alPusherService;