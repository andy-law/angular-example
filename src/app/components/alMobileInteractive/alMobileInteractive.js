/**
 * Mobile interactive
 */

var angular = require('angular');

var alMobileInteractiveTemplate = require('./alMobileInteractive.html');

var alMobileInteractive = angular.module('al.angularExample.components.alMobileInteractive', []);

alMobileInteractive.constant('MOBILE_INTERACTIVE_STATE_SIZE', 'MOBILE_INTERACTIVE_STATE_SIZE');
alMobileInteractive.constant('MOBILE_INTERACTIVE_STATE_THROW', 'MOBILE_INTERACTIVE_STATE_THROW');

/**
 * @ngdoc directive
 * @name al.angularExample.components.alMobileInteractive:alMobileInteractive
 * @restrict E
 * @scope
 *
 * @description
 * Touch screen to create a circle/ball, then throw/flick towards screen
 * Once off screen, request parent view to send off ball message to connected clients
 *
 * @example
 * <doc:example module="al.angularExample.components.alMobileInteractive.alMobileInteractive">
 	<doc:source>
 		<div></div>
 		<style></style>
 		<script></script>
 	</doc:source>
 </doc:example>
 */
alMobileInteractive.directive('alMobileInteractive', function(
	$document,
	$timeout,
	MOBILE_INTERACTIVE_STATE_SIZE,
	MOBILE_INTERACTIVE_STATE_THROW
	) {
	return {
		restrict: 'E',
		controller: 'alMobileInteractiveCtrl',
		template: alMobileInteractiveTemplate,
		replace: true,
		scope: {
			onSendBallRequested: '&'
		},
		link: function(scope, elem, attrs, ctrl) {

			var colour;
			var colourR;
			var colourG;
			var colourB;
			var circle;
			var scaleStep = 0.02;
			var size;
			var swipeStartTime;
			var swipeStartPoint;
			var swipeEndPoint;
			var scale;

			circle = elem.find('[data-role="circle"]');

			/**
			 * Set component to initial state, where we size the circle
 			 */
			function init() {
				scope.state = MOBILE_INTERACTIVE_STATE_SIZE;
				scope.cta = 'Hold your finger down anywhere on the screen to create a ball';

				$document.bind('touchstart', _onSizeTouchstart);
				$document.bind('touchmove', _onSizeTouchMove);
				$document.bind('touchend', _onSizeTouchEnd);
			}

			init();

			/////////////////////////////////////////////////////////////////////////
			// HANDLERS IN MOBILE_INTERACTIVE_STATE_SIZE STATE
			/////////////////////////////////////////////////////////////////////////

			/**
			 * Get a random colour for a circle, and start the loop of sizing it
			 * @param event
			 * @private
			 */
			function _onSizeTouchstart(event) {
				colour = getRandomColour();
				size = elem.width();
				scale = 0;
				$timeout(function() {
					scaleCircle(scale);
				}, 1000/60);

			}

			/**
			 * Loop through scaling the circle until state has been updated to the 'interactive' state, i.e. ready to flick at screen
			 * @param _scale
			 */
			function scaleCircle(_scale) {
				_scale += scaleStep;
				if(_scale >= 1 || _scale <= 0) {
					scaleStep *= -1;
				}

				circle.css({
					'width': size,
					'height': size,
					'background-color': colour,
					'-webkit-transform': 'scale('+ _scale +', '+ _scale +')',
					'transform': 'scale('+ _scale +', '+ _scale +')'
				});
				if(scope.state === MOBILE_INTERACTIVE_STATE_SIZE) {
					$timeout(function() {
						scaleCircle(_scale);
					}, 1000/60);
				} else {
					scale = _scale;
				}
			}

			/**
			 * Just prevent devault on touch move, so we don't scroll the page via touch
			 * Todo: only really need one touchmove function, returning after preventdefault if we're not in state MOBILE_INTERACTIVE_STATE_THROW
			 * @param event
			 * @private
			 */
			function _onSizeTouchMove(event) {
				event.preventDefault();
			}

			/**
			 * We've scaled our circle, so get ready to throw/flick at screen. Unbind previous listeners and bind to new ones for touchstart, touchmove and touchend
			 * @param event
			 * @private
			 */
			function _onSizeTouchEnd(event) {
				event.preventDefault();
				scope.state = MOBILE_INTERACTIVE_STATE_THROW;
				$document.unbind('touchstart', _onSizeTouchstart);
				$document.unbind('touchmove', _onSizeTouchMove);
				$document.unbind('touchend', _onSizeTouchEnd);
				scope.cta = 'Now flick the ball at the screen';
				$document.bind('touchstart', _onSwipeTouchStart);
				$document.bind('touchmove', _onSwipeTouchMove);
				$document.bind('touchend', _onSwipeTouchEnd);
			}

			/////////////////////////////////////////////////////////////////////////
			// HANDLERS IN MOBILE_INTERACTIVE_STATE_THROW STATE
			/////////////////////////////////////////////////////////////////////////

			/**
			 * Touch start, get a time at which the interaction started, so we can calculate duration, along with start point so we can calculate distance travelled over that time
			 * @param event
			 * @private
			 */
			function _onSwipeTouchStart(event) {
				swipeStartTime = Date.now();
				var touches = event.originalEvent.changedTouches;
				swipeStartPoint = {
					x: touches[0].pageX,
					y: touches[0].pageY
				};
				swipeEndPoint = swipeEndPoint || {};
				swipeEndPoint.x = touches[0].pageX;
				swipeEndPoint.y = touches[0].pageY;
			}

			/**
			 * Update the position of the circle, and update the endpoint as we don't get the relevant data in touchend event
			 * @param event
			 * @private
			 */
			function _onSwipeTouchMove(event) {
				event.preventDefault();
				var touches = event.originalEvent.changedTouches;
				swipeEndPoint = swipeEndPoint || {};
				swipeEndPoint.x = touches[0].pageX;
				swipeEndPoint.y = touches[0].pageY;
				var difference = {x: swipeEndPoint.x - swipeStartPoint.x, y: swipeEndPoint.y - swipeStartPoint.y};

				circle.css({
					'-webkit-transform': 'translate3d(' + difference.x + 'px, ' + difference.y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')',
					'transform': 'translate3d(' + difference.x + 'px, ' + difference.y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')'
				});
			}

			/**
			 * On touch end, make sure we've actually moved the circle. If we have, calculate direction, speed and animate off screen
			 * Once ball is off screen, tell parent to send off ball message with relevant data
			 * @param event
			 * @private
			 */
			function _onSwipeTouchEnd(event) {
				event.preventDefault();
				if(swipeStartPoint.x == swipeEndPoint.x && swipeStartPoint.y === swipeEndPoint.y) {
					return;
				}
				var swipeDuration = Date.now() - swipeStartTime,
					distance,
					direction,
					x, y,
					animateInterval,
					speed = 0,
					r = colourR/255,
					g = colourG/255,
					b = colourB/255;

				$document.unbind('touchstart', _onSwipeTouchStart);
				$document.unbind('touchmove', _onSwipeTouchMove);
				$document.unbind('touchend', _onSwipeTouchEnd);

				direction = {
					x: swipeEndPoint.x - swipeStartPoint.x,
					y: swipeEndPoint.y - swipeStartPoint.y
				};
				direction = normalize(direction);
				distance = getDistance(swipeEndPoint, swipeStartPoint);
				speed = distance / swipeDuration;
				speed *= 40; //TODO: arbritrary value, should be set in the Three Scene, preferably via interactive controls
				speed = speed < 1 ? 1 : speed;
				direction.x *= speed;
				direction.y *= speed;
				x = swipeEndPoint.x - swipeStartPoint.x;
				y = swipeEndPoint.y - swipeStartPoint.y;
				animateInterval = setInterval(function() {
					x += direction.x;
					y += direction.y;
					circle.css({
						'-webkit-transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')',
						'transform': 'translate3d(' + x + 'px, ' + y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')'
					});
					if(isCircleOffscreen(x, y)) {
						// transition is complete, clear interval and reset component
						clearInterval(animateInterval);
						scope.$apply(function() {
							init();
						});
						scope.onSendBallRequested({$data: {
							speed: speed,
							direction: normalize(direction),
							colour: {r: r, g: g, b: b},
							scale: scale
						}});
					}
				}, 1000/60);

			}

			/**
			 * Notmalize vector, for easier calculations
			 * @param vec
			 * @returns {{x: number, y: number}}
			 */
			function normalize(vec) {
				var magnitude = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
				return {
					x: vec.x * (1 / magnitude),
					y: vec.y * (1 / magnitude)
				};

			}

			/**
			 * Check if circle if off screen yet
			 * @param x
			 * @param y
			 * @returns {boolean}
			 */
			function isCircleOffscreen(x, y) {
				var circleRadius = size; //TODO: Should be divided by 2, but occasionally seeing side of circle on screen
				var docWidth = $document.outerWidth();
				var docHeight = $document.outerHeight();
				var x = x + (docWidth * .5);
				var y = y + (docHeight * .5);
				return (x + circleRadius < 0 || x - circleRadius > docWidth || y + circleRadius < 0 || y - circleRadius > docHeight);
			}

			/**
			 * Get disance between two vectors
			 * @param a
			 * @param b
			 * @returns {number}
			 */
			function getDistance(a, b) {
				var dx = a.x - b.x;
				var dy = a.y - b.y;
				return Math.sqrt(dx * dx + dy * dy);
			}

			/**
			 * Create a random rgb colour
			 * @returns {string}
			 */
			function getRandomColour() {
				colourR = Math.round(Math.random() * 255);
				colourG = Math.round(Math.random() * 255);
				colourB = Math.round(Math.random() * 255);
				return 'rgb(' + colourR + ', ' + colourG + ', ' + colourB + ')';
			}
		}
	}
});

alMobileInteractive.controller('alMobileInteractiveCtrl', function($scope) {

});

module.exports = alMobileInteractive;