# AngularJS Touch panorama

An AngularJS panorama implementation optimised for mobile devices.

Demo : http://cnjsstong2.github.io/angular-panorama

Comments and contributions welcome :)

## Usage :

 1. Add `angular-panorama.css` and `angular-panorama.js` (from this repo) to your code:
```html
<link href="lib/angular-panorama.css" rel="stylesheet" type="text/css" />
<script src="lib/angular.js"></script>
<script src="lib/angular-touch.js"></script>
<script src="lib/angular-panorama.js"></script>
```

 2. Add a dependency to the `angular-panorama` module in your application.
```js
angular.module('MyApp', ['angular-panorama']);
```

 3. Add a `ng-panorama` attribute to your `<ul>` block and your `<li>`'s become magically swipable ;)
```html
<ul ng-panorama class="image">
  <li ng-repeat="image in sportImages" style="background-image:url({{ image }});">
    <div class="layer">{{ image }}</div>
  </li>
</ul>
```
 4. You can also use `ng-panorama` without ng-repeat ;)
```html
<ul ng-panorama class="image">
  <li>slide #1</li>
  <li>slide #2</li>
  <li>slide #3</li>
</ul>
```
 5. Alternatively, for an infinite panorama, use the `ng-panorama-prev` and `ng-panorama-next` callbacks :
```html
<div ng-panorama-infinite ng-panorama-next="next(item)" ng-panorama-prev="prev(item)" ng-panorama-current="product">
  <h1> #{{ product.id }} </h1>
  {{ product.description }}
</div>
```

The `prev()` and `next()` function return promises containing the prev and next slide.

## Features :
 - Mobile friendly, tested on webkit+firefox
 - CSS 3D transformations with GPU accel

### Regular panorama :
 - `ng-panorama-index` two way binding to control the panorama position.
 - `ng-panorama-indicator` to turn on the indicator, see demo page.
 - `ng-panorama-buffered` to buffer the panorama, good to minimize the DOM.
 - ~~`ng-panorama-cycle` to have an forever-cycling panorama.~~ (BROKEN)
 - `ng-panorama-watch` force deep watch of the ngRepeat collection (listen to add/remove items).


### Infinite panorama :

 You can setup a dynamic, infinite panorama that will load slides on demand using a promise.
 - `ng-panorama-infinite` : use this to setup an infinite panorama without the initial ul/li structure.
 - `ng-panorama-next="getNextSlide(item)"` : callback called when panorama reach the last slide, that should return a single slide. great for generating slides on-demand.
 - `ng-panorama-prev="getPrevSlide(item)"` : callback called when panorama reach the first slide, that should return a single slide. great for generating slides on-demand.
 - `ng-panorama-current` : data-binding to the current panorama item. will be sent as first argument to the prev/next callbacks.

## Todo :
 - memory profiling
 - optional auto-slide
 - buffering : allow buffer size tuning (default=3 slides)
 - buffering : add intelligent indicators

## Inspirations
 - https://github.com/revolunet/angular-carousel
 - https://github.com/ajoslin/angular-mobile-nav
 - http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
 - Thanks @ganarajpr @bennadel and angular folks for all the tips :)

## License
As AngularJS itself, this module is released under the permissive [MIT license](http://mit-license.org). Your contributions are always welcome.
