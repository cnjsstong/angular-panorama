angular.module('angular-panorama')

.directive('ngPanoramaIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    template: '<div class="ng-panorama-indicator">' +
                '<span ng-repeat="item in items" ng-class="{active: $index==$parent.index}">●</span>' +
              '</div>'
  };
}]);
