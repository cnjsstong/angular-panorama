angular.module('angular-panorama')

    .directive('ngPanoramaNative', ['$swipe', '$document', '$window', function ($swipe, $document, $window) {
        return {
            restrict: 'A',
            scope: {
                pages: "=ngPanoramaNative",
                curIndex: "=ngPanoramaIndex",
                backgroundImage: "=ngPanoramaBackgroundImage"
            },
            link: function (scope, el, attr) {
                scope.$watch('backgroundImage', function (newValue) {
                    el.css('background-image', 'url(' + newValue + ')');
                });
                console.log(el);
                el.addClass('ng-panorama-container');
                var ul = el.find('ul');
                ul.addClass('ng-panorama-slides');
                if (!scope.curIndex) {
                    scope.curIndex = 0;
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
                    console.log(offset);
                    return offset;
                }

                function setOffset(offset) {
                    ul.css('-webkit-transform', 'translate3d(' + offset + 'px, 0, 0)');
                }

                var startCoords, startOffset;

                var cruiseOn = {'transition': 'all 0.2s ease-in'};
                var cruiseOff = {'transition': 'none'};
//
//                ul[0].addEventListener('webkitTransitionEnd', function() {
//                    ul.css('transition','none');
//                });

                $swipe.bind(el, {
                    start: function (coords) {
                        console.log('start: ', coords);
                        startCoords = coords;
                        startOffset = getOffsetByIndex(scope.curIndex);
                        ul.css(cruiseOff);
//                        ul.css('transition','none');
                    },
                    move: function (coords) {
//                        console.log('move: ', coords);
                        setOffset(startOffset + coords.x - startCoords.x);
                    },
                    end: function (coords) {
                        console.log('end: ', coords);
                        var targetIndex = scope.curIndex;
                        var threshold = el.prop('offsetWidth') * 0.12;
                        var delta = coords.x - startCoords.x;
                        console.log(delta, threshold);
                        if (delta > threshold && targetIndex >= 0) {
                            targetIndex--;
                        } else if (delta < -threshold && targetIndex < scope.pages.length - 1) {
                            targetIndex++;
                        }
                        console.log(scope.curIndex, targetIndex);
                        scope.$apply(function() {
                            scope.curIndex = targetIndex;
                        });
                        ul.css(cruiseOn);
//                        ul.css('transition','all 0.2s linear');
                        setOffset(getOffsetByIndex(scope.curIndex));
                    },
                    cancel: function (coords) {
                        console.log('cancel: ', coords);
                        ul.css(cruiseOn);
//                        ul.css('transition','all 0.2s linear');
                        setOffset(getOffsetByIndex(scope.curIndex));
                    }
                })
            }
        }
    }]);