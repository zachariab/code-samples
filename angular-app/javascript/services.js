'use strict';

/* Services */

var macsocialServices = angular.module('macsocial.services', ['ngResource']);

macsocialServices.factory('Post', ['$resource',
  function($resource){
    return $resource('api/posts', {}, {
      query: {method:'GET', params:{}, isArray:false},
      update: {method: 'POST', params: {}, isArray: false}
    });
  }]);

macsocialServices.factory('Feed', ['$resource',
  function($resource){
    return $resource('api/feeds', {}, {
      query: {method:'GET', params:{}, isArray:false},
      update: {method: 'POST', params: {}, isArray: false},
      put: {method: 'PUT', params: {}, isArray: false},
      remove: {method: 'DELETE', params: {}, isArray: false}
    });
  }]);

macsocialServices.factory('Filter', ['$resource',
  function($resource){
    return $resource('api/filters', {}, {
      query: {method:'GET', params:{}, isArray:false}
    });
  }]);

macsocialServices.factory('Stats', ['$resource',
  function($resource){
    return $resource('api/stats', {}, {
      query: {method:'GET', params:{}, isArray:false}
    });
  }]);