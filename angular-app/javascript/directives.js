'use strict';

/* Directives */


// not finished
angular.module('macsocial.directives', []).directive('focusPrevious', function($timeout) {
    return {
        restrict: 'A',
        scope: true,
        link: function(_scope, _element, _attr) {
            _element.bind('click', function() {
            	$timeout(function(){
            	}, 10);
            });
        }
    };
});
