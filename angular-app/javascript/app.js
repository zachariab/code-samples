'use strict';


// Declare app level module which depends on filters, and services
angular.module('macsocial', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'ngSanitize',
  'iso.directives',
  'iso.services',
  'ui.sortable',
  'mgcrea.ngStrap',
  'macsocial.filters',
  'macsocial.services',
  'macsocial.directives',
  'macsocial.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/posts/:statusFilter/:postAction/:postId', {templateUrl: 'partials/posts.html', controller: 'postController'});
  $routeProvider.when('/posts/:statusFilter', {templateUrl: 'partials/posts.html', controller: 'postController'});
  $routeProvider.when('/posts', {templateUrl: 'partials/posts.html', controller: 'postController'});
  $routeProvider.when('/feeds', {templateUrl: 'partials/feeds.html', controller: 'feedController'});
  $routeProvider.when('/filters', {templateUrl: 'partials/filters.html', controller: 'filterController'});
  $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: 'settingsController'});
  $routeProvider.otherwise({redirectTo: '/posts/pending'});
}]);
