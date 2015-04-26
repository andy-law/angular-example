/**
 * Mobile interactive
 */

var angular = require('angular');

var alMobileInteractiveTemplate = require('./alMobileInteractive.html');

var alMobileInteractive = angular.module('al.angularExample.components.alMobileInteractive', []);

alMobileInteractive.constant('MOBILE_INTERACTIVE_STATE_SIZE', 'MOBILE_INTERACTIVE_STATE_SIZE');
alMobileInteractive.constant('MOBILE_INTERACTIVE_STATE_THROW', 'MOBILE_INTERACTIVE_STATE_THROW');

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

			function reset() {
				scope.state = MOBILE_INTERACTIVE_STATE_SIZE;
				scope.cta = 'Hold your finger down anywhere on the screen to create a ball';

				$document.bind('touchstart', _onSizeTouchstart);
				$document.bind('touchmove', _onSizeTouchMove);
				$document.bind('touchend', _onSizeTouchEnd);
			}

			reset();

			function _onSizeTouchstart(event) {
				colour = getRandomColour();
				size = elem.width();
				scale = 0;
				$timeout(function() {
					scaleCircle(scale);
				}, 1000/60);

			}

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

			function _onSizeTouchMove(event) {
				event.preventDefault();
			}

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

			function _onSwipeTouchStart(event) {
				swipeStartTime = Date.now();
				var touches = event.originalEvent.changedTouches;
				console.log('start', event);
				swipeStartPoint = {
					x: touches[0].pageX,
					y: touches[0].pageY
				};
				swipeEndPoint = swipeEndPoint || {};
				swipeEndPoint.x = touches[0].pageX;
				swipeEndPoint.y = touches[0].pageY;
			}

			function _onSwipeTouchMove(event) {
				event.preventDefault();
				var touches = event.originalEvent.changedTouches;
				swipeEndPoint = swipeEndPoint || {};
				swipeEndPoint.x = touches[0].pageX;
				swipeEndPoint.y = touches[0].pageY;
				var difference = {x: swipeEndPoint.x - swipeStartPoint.x, y: swipeEndPoint.y - swipeStartPoint.y};

				console.log('difference', difference);
				console.log('translate3d(' + difference.x + 'px, ' + difference.y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')');

				circle.css({
					'-webkit-transform': 'translate3d(' + difference.x + 'px, ' + difference.y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')',
					'transform': 'translate3d(' + difference.x + 'px, ' + difference.y + 'px, ' + 0 + ') scale(' + scale + ', ' + scale + ')'
				});
			}

			function _onSwipeTouchEnd(event) {
				var touches = event.changedTouches,
					swipeDuration = Date.now() - swipeStartTime,
					distance,
					direction,
					x, y,
					animateInterval,
					speed = 0,
					r = colourR/255,
					g = colourG/255,
					b = colourB/255;
				event.preventDefault();

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
				speed *= 10;
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
						clearInterval(animateInterval);
						scope.$apply(function() {
							reset();
						});
						scope.onSendBallRequested({data: {
							speed: speed,
							direction: normalize(direction),
							colour: {r: r, g: g, b: b},
							scale: scale
						}});
					}
				}, 1000/60);

			}

			function normalize(vec) {
				var magnitude = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
				return {
					x: vec.x * (1 / magnitude),
					y: vec.y * (1 / magnitude)
				};

			}

			function isCircleOffscreen(x, y) {
				var circleRadius = parseFloat(size * scale, 10) * .5;
				var docWidth = $document.width();
				var docHeight = $document.height();
				var x = x + (docWidth * .5);
				var y = y + (docHeight * .5);
				return (x + circleRadius < 0 || x - circleRadius > docWidth || y + circleRadius < 0 || y - circleRadius > docHeight);
			}

			function getDistance(a, b) {
				var dx = a.x - b.x;
				var dy = a.y - b.y;
				return Math.sqrt(dx * dx + dy * dy);
			}

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