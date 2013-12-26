angular.module('angular-panorama')

.directive('ngPanoramaInfinite', ['$parse', '$compile', function($parse, $compile) {
  return {
    restrict: 'EA',
    transclude:  true,
    replace: true,
    scope: true,
    template: '<ul ng-panorama ng-panorama-buffered><li ng-transclude></li></ul>',
    compile: function(tElement, tAttrs, linker) {
      var repeatExpr = tAttrs.rnpanoramaCurrent + ' in items';
      tElement.children('li').attr('ng-repeat', repeatExpr);
      return function(scope, iElement, iAttrs) {
        // wrap the original content in a real ng-panorama
        scope.items = [$parse(iAttrs.rnpanoramaCurrent)(scope)];
        scope.$watchCollection('panoramaCollection.position', function(newValue) {
          // assign the new item to the parent scope
          $parse(iAttrs.rnpanoramaCurrent).assign(scope.$parent, scope.items[newValue]);
        });
      };
    }
  };
}]);
