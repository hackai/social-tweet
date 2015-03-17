angular.module('config', ['ngResource']).factory('config', function ($resource) {
  //var mode = 'local';
  var mode = 'dev';
  this.local = {};
  this.dev = {};
  this.prod = {};
  this.local.restUrl = 'http://localhost:9090/';
  this.dev.restUrl = 'http://184.172.34.106/rest/';
  this.prod.restUrl = 'http://api.zootrock.com/';
  return this[mode];
});