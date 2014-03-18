/**
 * Angular Panorama - Mimic Windows Phone's Panorama UI control.
 * @version v0.2.0 - 2014-03-18
 * @link http://cnjsstong2.github.com/angular-panorama
 * @author Tong Shen <tshen@farseerinc.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('angular-panorama', ['ngTouch']);

angular.module('angular-panorama')

    .directive('ngPanorama', ['$swipe', function ($swipe) {
        return {
            restrict: 'A',
            scope: {
                pages: "=ngPanorama",
                i: "=ngPanoramaIndex",
                bg: "=ngPanoramaBackgroundImage",
                reset: "=ngPanoramaReset"
            },
            link: function (scope, el, attr) {
                scope.$watch('bg', function (newValue) {
                    if (newValue) {
                        el.css('background-image', 'url(' + newValue + ')');
                    }
                });
                scope.$watch('i', function (newValue) {
                    setOffset(getOffsetByIndex(newValue));
                });
                scope.$watch('reset', function (newValue) {
                    ul.css(cruiseOff);
                    setOffset(0);
                    ul.css(cruiseOn);
                });

                el.addClass('ng-panorama-container');
                var ul = el.find('ul');
                ul.addClass('ng-panorama-slides');
                if (!scope.i) {
                    scope.i = 0;
                }
                function getOffsetByIndex(index) {
                    var offset = 0;
                    var containerWidth = el.prop('offsetWidth');
                    for (var i = 0; i < index; i++) {
                        offset -= (scope.pages[i].width || 100) * containerWidth / 100;
                    }
                    if (index > 0) {
                        var fine = (100 - scope.pages[index].width) / 2 * containerWidth / 100;
                        offset += fine;
                        if (index == scope.pages.length - 1) {
                            offset += fine;
                        }
                    }
                    return parseInt(offset, 10);
                }

                function setOffset(offset) {
                    ul.css({
                        '-webkit-transform': 'translate3d(' + offset + 'px, 0, 0)',
                        'transform': 'translate3d(' + offset + 'px, 0, 0)'
                    });
                }

                var startCoords, startOffset;

                var cruiseOn = {
                    'transition': 'all 0.2s ease',
                    '-webkit-transition': 'all 0.2s ease'
                };
                var cruiseOff = {
                    'transition': 'none',
                    '-webkit-transition': 'none'
                };

                $swipe.bind(el, {
                    start: function (coords) {
                        startCoords = coords;
                        startOffset = getOffsetByIndex(scope.i);
                        ul.css(cruiseOff);
                    },
                    move: function (coords) {
                        setOffset(startOffset + coords.x - startCoords.x);
                    },
                    end: function (coords) {
                        var targetIndex = scope.i;
                        var threshold = el.prop('offsetWidth') * 0.1;
                        var delta = coords.x - startCoords.x;
                        if (delta > threshold && targetIndex > 0) {
                            targetIndex--;
                        } else if (delta < -threshold && targetIndex < scope.pages.length - 1) {
                            targetIndex++;
                        }
                        scope.$apply(function () {
                            scope.i = targetIndex;
                        });
                        ul.css(cruiseOn);
                        setOffset(getOffsetByIndex(scope.i));
                    },
                    cancel: function (coords) {
                        ul.css(cruiseOn);
                        setOffset(getOffsetByIndex(scope.i));
                    }
                });
            }
        };
    }]);