/**
 * Desktop WebGL interactive view
 */

var angular = require('angular');
var THREE = require('THREE');

var alDesktopInteractiveTemplate = require('./alDesktopInteractive.html');

var alDesktopInteractive = angular.module('al.angularExample.components.alDesktopInteractive', []);

/**
 * @ngdoc directive
 * @name al.angularExample.components.alDesktopInteractive:alDesktopInteractive
 * @restrict E
 * @scope
 *
 * @description
 * Listen to 'NEW_BALL_REQUESTED' events requesting balls to be rendered to screen.
 * Once event is received, render the ball into the Three JS scene according to params passed from mobile flick
 *
 * To do - add in a params panel to amend speed, gravity, lighting etc
 *
 * @example
 * <doc:example module="al.angularExample.components.alDesktopInteractive.alDesktopInteractive">
 	<doc:source>
 		<div></div>
 		<style></style>
 		<script></script>
 	</doc:source>
 </doc:example>
 */
alDesktopInteractive.directive('alDesktopInteractive', function(
	$document,
	NEW_BALL_REQUESTED
	) {
	return {
		restrict: 'E',
		controller: 'alDesktopInteractiveCtrl',
		template: alDesktopInteractiveTemplate,
		replace: true,
		link: function(scope, elem, attrs, ctrl) {

			var activeBalls = [];
			var spareBalls = [];
			var renderer = new THREE.WebGLRenderer({alpha: true, precision: 'highp', antialias: true, preserveDrawingBuffer: true});
			renderer.setSize($document.width(), $document.height());
			elem.append(renderer.domElement);
			angular.element(renderer.domElement).css({
				position: 'fixed',
				left: 0,
				top: 0
			});
			var lightContainer = new THREE.Object3D();
			lightContainer.add(new THREE.AmbientLight(0x404040));
			var pointLight = new THREE.PointLight(0xDDDDDD, 1, 20000);
			pointLight.position.set(100, -300, 80);
			pointLight.lookAt(new THREE.Vector3());
			lightContainer.add(pointLight);

			var camera = new THREE.PerspectiveCamera( 60, $document.width() / $document.height(), 1, 20000 );
			camera.position.x = 0;
			camera.position.y = 0;
			camera.position.z = 80;

			var scene = new THREE.Scene(camera);
			scene.add(lightContainer);

			startRenderLoop();

			function startRenderLoop() {
				window.requestAnimationFrame( _render );
			}

			function _render() {
				window.requestAnimationFrame( _render );
				renderer.render(scene, camera);

				activeBalls.forEach(function(ball) {
					ball.update();
				}, this);
			}

			scope.$on(NEW_BALL_REQUESTED, addBall);

			function addBall(event, params) {
				var ball, sphere;
				if(spareBalls.length > 0) {
					ball = spareBalls.splice(0, 1)[0];
				} else {
					sphere = new THREE.Mesh(new THREE.SphereGeometry(300, 300, 80), new THREE.MeshPhongMaterial({color: 0xFF0000}));
					ball = new BouncingBall(sphere, recycleBallHandler);
				}
				ball.init(params);
				activeBalls.push(ball);
				scene.add(ball.ball);

			}

			function recycleBallHandler(ball) {
				var index = activeBalls.indexOf(ball);
				scene.remove(ball.ball);
				spareBalls.push(activeBalls.splice(index, 1)[0]);
			}

			/**
			 * Function responsible for rendering the ball bouncing away from camera
			 * @param ball
			 * @param recycleBallHandler
			 * @constructor
			 */
			function BouncingBall(ball, recycleBallHandler) {
				this.ball = ball;
				this.gravity = 1.3;
				this.colour = new THREE.Color();

				this.init = function(params) {
					console.log('params', params);
					this.params = params;
					this.ball.position.x = 0;
					this.ball.position.y = 0;
					this.ball.position.z = 0;
					this.params.direction.y *= params.speed;
					this.params.direction.x *= params.speed;
					this.colour.setRGB(this.params.colour.r, this.params.colour.g, this.params.colour.b);
					this.ball.material.color = this.colour;
					this.ball.material.ambient = this.colour;
					this.currentY = this.params.direction.y;
					this.ball.scale.set( this.params.scale, this.params.scale, this.params.scale );
				}

				this.update = function() {
					this.currentY -= this.gravity;
					this.ball.position.z -= this.params.speed;
					this.ball.position.y += this.currentY;
					this.ball.position.x += this.params.direction.x;
					if( this.ball.position.y < -600 + (150 * this.params.scale) ) {
						this.ball.position.y = -600 + (150 * this.params.scale);
						this.currentY = this.currentY * -0.95;
					}
					if(this.ball.position.z < -20000) {
						recycleBallHandler(this);
					}
				}
			}
		}
	}
});

alDesktopInteractive.controller('alDesktopInteractiveCtrl', function($scope) {

});

module.exports = alDesktopInteractive;