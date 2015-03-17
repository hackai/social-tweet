//for index page structure.
var App = angular.module('App', [
    'ngResource',
    'ngCookies',
    'ng',
    'share',
    'ngMockE2E',
    'App.controllers'
  ], function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }).run(function ($httpBackend) {
    var baseUrl = 'http://localhost:9090/';
    $httpBackend.whenGET(/preview\/.*/).respond([]);
    // $httpBackend.whenGET(/views\/.*/).passThrough();
    // $httpBackend.whenGET(/js\/.*/).passThrough();
    // $httpBackend.whenGET(/[user,channel,streams]/).passThrough();
    // $httpBackend.whenGET(/channel/).passThrough();
    $httpBackend.whenGET(/.*/).passThrough();
  });