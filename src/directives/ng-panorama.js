angular.module('angular-panorama')

    .directive('ngPanorama', ['$compile', '$parse', '$swipe', '$document', '$window', 'CollectionManager', function ($compile, $parse, $swipe, $document, $window, CollectionManager) {
        /* track number of panorama instances */
        var panoramas = 0;

        return {
            restrict: 'A',
            scope: true,
            compile: function (tElement, tAttrs) {

                tElement.addClass('ng-panorama-slides');

                /* extract the ngRepeat expression from the first li attribute
                 this expression will be used to update the panorama
                 buffered panoramas will add a slice operator to that expression

                 if no ng-repeat found, try to use existing <li> DOM nodes
                 */
                var repeater;
                var repeaterChilds = tElement.children('li');
                for (var rrr=0; rrr<repeaterChilds.length; rrr++) {
                    if (repeaterChilds[rrr].attributes['ng-repeat']) {
                        repeater = repeaterChilds[rrr];
                    }
                }
                var liAttributes = repeater.attributes,
                    repeatAttribute = liAttributes['ng-repeat'],
                    isBuffered = false,
                    originalCollection,
                    fakeArray;
                console.log(repeater);
                console.log(repeatAttribute);

                if (!repeatAttribute) repeatAttribute = liAttributes['data-ng-repeat'];
                if (!repeatAttribute) repeatAttribute = liAttributes['x-ng-repeat'];
                if (!repeatAttribute) {
                    var liChilds = tElement.children('li');
                    if (liChilds.length < 2) {
                        throw new Error("panorama: cannot find the ngRepeat attribute OR no childNodes detected");
                    }
                    // if we use DOM nodes instead of ng-repeat, create a fake collection
                    originalCollection = 'fakeArray';
                    fakeArray = Array.prototype.slice.apply(liChilds);                      // Converting liChilds from object to array. liChilds.slice() in ES5
                    console.log('fakeArray');
                    console.log(fakeArray);
                } else {
                    var exprMatch = repeatAttribute.value.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
                        originalItem = exprMatch[1],
                        trackProperty = exprMatch[3] || '';
                    originalCollection = exprMatch[2];
                    isBuffered = angular.isDefined(tAttrs['ngPanoramaBuffered']);

                    /* update the current ngRepeat expression and add a slice operator */
                    repeatAttribute.value = originalItem + ' in panoramaCollection.cards ' + trackProperty;
                }
                return function (scope, iElement, iAttrs, controller) {
                    panoramas++;
                    var panoramaId = 'ng-panorama-' + panoramas,
                        swiping = 0,                    // swipe status
                        startX = 0,                     // initial swipe
                        startOffset = 0,               // first move offset
                        offset = 0,                    // move offset
                        minSwipePercentage = 0.1,       // minimum swipe required to trigger slide change
                        containerWidth = 0,          // store width of the first slide
                        skipAnimation = true;

                    /* add a wrapper div that will hide the overflow */
                    var panorama = iElement.wrap("<div id='" + panoramaId + "' class='ng-panorama-container'></div>"),
                        container = panorama.parent();


                    if (fakeArray) {
                        // publish the fakeArray on the scope to be able to add indicators
                        scope.fakeArray = fakeArray;
                    }

                    function getTransformCoordinates(el) {
                        var results = angular.element(el).css('transform').match(/translate3d\((-?\d+(?:px)?),\s*(-?\d+(?:px)?),\s*(-?\d+(?:px)?)\)/);
                        if (!results) return [0, 0, 0];
                        return results.slice(1, 3);
                    }

                    function transitionEndCallback(event) {
                        /* when slide transition finished, update buffer */
                        if ((event.target && event.target === panorama[0]) && (
                            event.propertyName === 'transform' ||
                                event.propertyName === '-webkit-transform' ||
                                event.propertyName === '-moz-transform')
                            ) {
                            scope.$apply(function () {
                                checkEdges();
                                scope.panoramaCollection.adjustBuffer();
                                updateSlidePosition(true);
                            });

                            // we should replace the 3d transform with 2d transform to prevent blurry effect on some phones (eg: GS3)
                            // todo : use non-3d version for browsers not supporting it
                            panorama.css(translateSlideProperty(getTransformCoordinates(panorama[0]), true));

                        }
                    }

                    function updateSlides(method, items) {
                        // force apply if no apply/digest phase in progress
                        function cb() {
                            skipAnimation = true;
                            scope.panoramaCollection[method](items, true);
                        }

                        if (!scope.$$phase) {
                            scope.$apply(cb);
                        } else {
                            cb();
                        }

                    }

                    function addSlides(position, items) {
                        var method = (position === 'after') ? 'push' : 'unshift';
                        if (items) {
                            if (angular.isObject(items.promise)) {
                                items.promise.then(function (items) {
                                    if (items) {
                                        updateSlides(method, items);
                                    }
                                });
                            } else if (angular.isFunction(items.then)) {
                                items.then(function (items) {
                                    if (items) {
                                        updateSlides(method, items);
                                    }
                                });
                            } else {
                                updateSlides(method, items);
                            }
                        }
                    }

                    function checkEdges() {
                        var position = scope.panoramaCollection.position,
                            lastIndex = scope.panoramaCollection.getLastIndex(),
                            slides = null;
                        if (position === 0 && angular.isDefined(iAttrs.ngPanoramaPrev)) {
                            slides = $parse(iAttrs.ngPanoramaPrev)(scope, {
                                item: scope.panoramaCollection.cards[0]
                            });
                            addSlides('before', slides);
                        }
                        if (position === lastIndex && angular.isDefined(iAttrs.ngPanoramaNext)) {
                            slides = $parse(iAttrs.ngPanoramaNext)(scope, {
                                item: scope.panoramaCollection.cards[scope.panoramaCollection.cards.length - 1]
                            });
                            addSlides('after', slides);
                        }
                    }

                    scope.$watch('originalCollection');
                    var collectionModel = $parse(originalCollection);
                    var collectionParams = {};

                    /* ng-panorama-index attribute data binding */
                    var initialIndex = 0;
                    if (iAttrs.ngPanoramaIndex) {
                        var indexModel = $parse(iAttrs.ngPanoramaIndex);
                        if (angular.isFunction(indexModel.assign)) {
                            /* check if this property is assignable then watch it */
                            scope.$watch('panoramaCollection.index', function (newValue) {
                                indexModel.assign(scope.$parent, newValue);
                            });
                            initialIndex = indexModel(scope);
                            scope.$parent.$watch(indexModel, function (newValue, oldValue) {
                                if (newValue !== undefined) {
                                    scope.panoramaCollection.goToIndex(newValue, true);
                                }
                            });
                        } else if (!isNaN(iAttrs.ngPanoramaIndex)) {
                            /* if user just set an initial number, set it */
                            initialIndex = parseInt(iAttrs.ngPanoramaIndex, 10);
                        }
                    }

                    if (angular.isDefined(iAttrs.ngPanoramaCycle)) {
                        collectionParams.cycle = true;
                    }
                    collectionParams.index = initialIndex;

                    if (isBuffered) {
                        collectionParams.bufferSize = 3;
                        collectionParams.buffered = true;
                    }

                    // initialise the collection
                    scope.panoramaCollection = CollectionManager.create(collectionParams);

                    scope.$watch('panoramaCollection.updated', function (newValue, oldValue) {
                        if (newValue) updateSlidePosition();
                    });

                    var collectionReady = false;
                    scope.$watch(collectionModel, function (newValue, oldValue) {
                        // update whole collection contents
                        // reinitialise index
                        scope.panoramaCollection.setItems(newValue, collectionReady);
                        collectionReady = true;
                        if (containerWidth === 0) updateContainerWidth();
                        updateSlidePosition();
                    });

                    if (angular.isDefined(iAttrs.ngPanoramaWatch)) {
                        scope.$watch(originalCollection, function (newValue, oldValue) {
                            // partial collection update, watch deeply so use carefully
                            scope.panoramaCollection.setItems(newValue, false);
                            collectionReady = true;
                            if (containerWidth === 0) updateContainerWidth();
                            updateSlidePosition();
                        }, true);
                    }

                    var vendorPrefixes = ["webkit", "moz"];

                    function genCSSProperties(property, value) {
                        /* cross browser CSS properties generator */
                        var css = {};
                        css[property] = value;
                        angular.forEach(vendorPrefixes, function (prefix, idx) {
                            css['-' + prefix.toLowerCase() + '-' + property] = value;
                        });
                        return css;
                    }

                    function translateSlideProperty(offset, is3d) {
                        if (is3d) {
                            return genCSSProperties('transform', 'translate3d(' + offset + 'px,0,0)');
                        } else {
                            return genCSSProperties('transform', 'translate(' + offset + 'px,0)');
                        }
                    }

                    panorama[0].addEventListener('webkitTransitionEnd', transitionEndCallback, false);  // webkit
                    panorama[0].addEventListener('transitionend', transitionEndCallback, false);        // mozilla

                    // when orientation change, force width re-redetection
                    window.addEventListener('orientationchange', resize);
                    // when window is resized (responsive design)
                    window.addEventListener('resize', resize);

                    function resize() {
                        updateContainerWidth();
                        updateSlidePosition();
                    }

                    function updateContainerWidth() {
                        container.css('width', 'auto');
                        skipAnimation = true;
                        var slides = panorama.children('li');
                        if (slides.length === 0) {
                            containerWidth = panorama[0].getBoundingClientRect().width;
                        } else {
                            containerWidth = slides[0].getBoundingClientRect().width;
                        }
                        container.css('width', containerWidth + 'px');
                        return containerWidth;
                    }

                    if(angular.isDefined(iAttrs.ngPanoramaBackgroundImage)) {
                        container.css('background-image', 'url('+iAttrs.ngPanoramaBackgroundImage+')');
                        container.css('background-position','0% 50%');
//                        container.css('background-repeat', 'no-repeat');
//                        container.css('background-attachment', 'fixed');
//                        container.css('background-position', '0% 50%');
                    }

                    /* enable panorama indicator */
                    if (angular.isDefined(iAttrs.ngPanoramaIndicator)) {
                        var indicator = $compile("<div id='" + panoramaId + "-indicator' index='panoramaCollection.index' items='panoramaCollection.items' data-ng-panorama-indicators class='ng-panorama-indicator'></div>")(scope);
                        container.append(indicator);
                    }

                    function updateSlidePosition(forceSkipAnimation) {
                        /* trigger panorama position update */
                        skipAnimation = !!forceSkipAnimation || skipAnimation;
                        if (containerWidth === 0) updateContainerWidth();
                        offset = Math.round(scope.panoramaCollection.getOffsetWithWidth(scope.panoramaCollection.getRelativeIndex()) * containerWidth / 100);//scope.panoramaCollection.getRelativeIndex() * -containerWidth);
                        if (skipAnimation === true) {
                            panorama.removeClass('ng-panorama-animate')
                                .addClass('ng-panorama-noanimate')
                                .css(translateSlideProperty(offset, false));
                        } else {
                            panorama.removeClass('ng-panorama-noanimate')
                                .addClass('ng-panorama-animate')
                                .css(translateSlideProperty(offset, true));
                        }
                        skipAnimation = false;
                    }

                    /* bind events */

                    function swipeEnd(coords) {
                        /* when movement ends, go to next slide or stay on the same */
                        $document.unbind('mouseup', documentMouseUpEvent);
                        if (containerWidth === 0) updateContainerWidth();
                        if (swiping > 1) {
                            var lastIndex = scope.panoramaCollection.getLastIndex(),
                                position = scope.panoramaCollection.position,
                                slideOffset = (offset < startOffset) ? 1 : -1,
                                tmpSlideIndex = Math.min(Math.max(0, position + slideOffset), lastIndex);
                            var delta = coords.x - startX;
                            if (Math.abs(delta) <= containerWidth * minSwipePercentage) {
                                /* prevent swipe if not swipped enough */
                                tmpSlideIndex = position;
                            }
                            var changed = (position !== tmpSlideIndex);
                            //console.log(offset, startOffset, slideOffset);
                            /* reset slide position if same slide (watch not triggered) */
                            if (!changed) {
                                scope.$apply(function () {
                                    updateSlidePosition();
                                });
                            } else {
                                scope.$apply(function () {
                                    if (angular.isDefined(iAttrs.ngPanoramaCycle)) {
                                        // force slide move even if invalid position for cycle panoramas
                                        scope.panoramaCollection.position = tmpSlideIndex;
                                        updateSlidePosition();
                                    }
                                    console.log(tmpSlideIndex);
                                    console.log(lastIndex);
                                    var per=tmpSlideIndex / lastIndex * 100;
                                    container.css('background-position',per+'% 50%');
                                    scope.panoramaCollection.goTo(tmpSlideIndex, true);
                                });
                            }
                        }
                        swiping = 0;
                        //console.log(scope.panoramaCollection);
                    }

                    function isInsidepanorama(coords) {
                        // check coords are inside the panorama area
                        // we always compute the container dimensions in case user have scrolled the page
                        var containerRect = container[0].getBoundingClientRect();

                        var isInside = (coords.x > containerRect.left && coords.x < (containerRect.left + containerWidth) &&
                            (coords.y > containerRect.top && coords.y < containerRect.top + containerRect.height));

                        // console.log('isInsidepanorama', {
                        //   containerLeft: containerRect.left,
                        //   containerTop: containerRect.top,
                        //   containerHeight: containerRect.height,
                        //   isInside: isInside,
                        //   x: coords.x,
                        //   y: coords.y
                        // });
                        return isInside;
                    }

                    function documentMouseUpEvent(event) {
                        swipeEnd({
                            x: event.clientX,
                            y: event.clientY
                        });
                    }

                    // move throttling
                    var lastMove = null,
                    // todo: requestAnimationFrame instead
                        moveDelay = ($window.jasmine || $window.navigator.platform == 'iPad') ? 0 : 50;

                    $swipe.bind(panorama, {
                        /* use angular $swipe service */
                        start: function (coords) {
                            // console.log('$swipe start');
                            /* capture initial event position */
                            if (swiping === 0) {
                                swiping = 1;
                                startX = coords.x;
                            }
                            $document.bind('mouseup', documentMouseUpEvent);
                        },
                        move: function (coords) {
                            // cancel movement if not inside
                            if (!isInsidepanorama(coords)) {
                                // console.log('force end');
                                swipeEnd(coords);
                                return;
                            }
                            //console.log('$swipe move');
                            if (swiping === 0) return;
                            var deltaX = coords.x - startX;
                            if (swiping === 1 && deltaX !== 0) {
                                swiping = 2;
                                startOffset = offset;
                            }
                            else if (swiping === 2) {
                                var now = (new Date()).getTime();
                                if (lastMove && (now - lastMove) < moveDelay) return;
                                lastMove = now;
                                var lastIndex = scope.panoramaCollection.getLastIndex(),
                                    position = scope.panoramaCollection.position;
                                /* ratio is used for the 'rubber band' effect */
                                var ratio = 1;
                                if ((position === 0 && coords.x > startX) || (position === lastIndex && coords.x < startX))
                                    ratio = 3;
                                /* follow cursor movement */
                                offset = startOffset + deltaX / ratio;
                                panorama.css(translateSlideProperty(offset, true))
                                    .removeClass('ng-panorama-animate')
                                    .addClass('ng-panorama-noanimate');

                            }
                        },
                        end: function (coords) {
                            //console.log('$swipe end');
                            swipeEnd(coords);
                        }
                    });
                    //  if (containerWidth===0) updateContainerWidth();
                };
            }
        };
    }]);
