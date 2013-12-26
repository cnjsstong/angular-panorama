/*global angular */

/*
Angular touch panorama with CSS GPU accel and slide buffering/cycling
http://github.com/revolunet/angular-panorama

TODO : 
 - skip initial animation
 - add/remove ngRepeat collection
 - prev/next cbs
 - cycle + no initial index ? (is -1 and has bug)
 - cycle + indicator
*/

angular.module('angular-panorama', ['ngTouch']);
