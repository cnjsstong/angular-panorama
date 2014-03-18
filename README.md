# Angular Panorama

An AngularJS panorama implementation optimised for mobile devices, supporting width setting for each page. 

I may add a demo here later...

Comments and contributions welcome :)

## Usage :

 1. Add Angular Panorama to your project by:
	bower install angular-panorama --save	

 2. Add `angular-panorama.css` and `angular-panorama.js` (from this repo) to your code:
```html
<link href="bower_components/angular-panorama/angular-panorama.css" rel="stylesheet" type="text/css" />
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-touch/angular-touch.js"></script>
<script src="bower_components/angular-panorama/angular-panorama.js"></script>
```

 2. Add a dependency to the `angular-panorama` module in your application.
```js
angular.module('MyApp', ['angular-panorama']);
```

 3. Add a model (e.g. `pages` here) including width values if you need. The width values must be integers, representing percentages. For example, if you want a page to be 80% width of the viewport, just set the `width` to `80`. If you don't set the width, it will be 100% by default.
 
 4. Add a `div` with `ng-panorama` attribute to your html and wrap a `<ul>` inside. Every `<li>` child of this `<ul>` will become a swipable page with specified width.
```html
<div ng-panorama="pages" ng-panorama-index="index" ng-panorama-reset="reset"
     ng-panorama-background-image="backgroundImageUrl">
	<ul>
		<li ng-repeat="page in pages" style="width: {{page.width}}%;" ng-cloak>
	</ul>
</div>
```

 4. You can also use `ng-panorama` without ng-repeat, or even a mix.
```html
<script>
// in your controller code
	$scope.pages = [
		{width: 80},
		{width: 80},
		{width: 80},
		{width: 80}
	];
	
</script>
<div ng-panorama="pages" ng-panorama-index="index" ng-panorama-reset="reset"
     ng-panorama-background-image="backgroundImageUrl">
	<ul>
		<li style="width: 80%;">
		<li style="width: 80%;">
		<li style="width: 80%;">
		<li style="width: 80%;">
	</ul>
</div>
```

## Features :
 - Mobile friendly, tested on Chrome + Android WebView(<4.4)
 - Super flexible. Completely rewrited in the {{ angular way }}.
 - CSS 3D transformations with GPU accel

## Attributes :
 - `ng-panorama-index` adds two-way binding to control the panorama position.
 - `ng-panorama-background-image` adds background image. 
 - `ng-panorama-reset` reset the panorama to `index`=0 skipping animation.


## Inspirations
 - https://github.com/revolunet/angular-carousel

## License
Angular Panorama is created by Tong Shen from [FotoDish](http://fotodish.com), and is distributed under the [MIT license](http://mit-license.org) .
