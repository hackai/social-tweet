//for index page structure.
var App = angular.module('App', [
    'ngRoute',
    'ngResource',
    'ngCookies',
    'ng',
    'share',
    'App.controllers',
    'config',
  ], function ($locationProvider) {
    // $locationProvider.html5Mode(true);
  }).config([
    '$httpProvider',
    '$routeProvider',
    function ($httpProvider, $routeProvider) {
      var interceptor = [
          '$q',
          '$injector',
          '$rootScope',
          function ($q, $injector, $rootScope) {
            var $http;
            function success(response) {
              if(response.config.url.indexOf('historyItem') != -1)
                return response;
              if (response.config.method != 'GET' && response.config.url.indexOf('activate') == -1) {
                $rootScope.$broadcast('deactivateChannel');
              }
              return response;
            }
            function error(response) {
              // get $http via $injector because of circular dependency problem
              $http = $http || $injector.get('$http');
              return $q.reject(response);
            }
            return function (promise) {
              return promise.then(success, error);
            };
          }
        ];
      $httpProvider.responseInterceptors.push(interceptor);
      $routeProvider.when('/settings', {templateUrl: 'views/settings.html'});
      $routeProvider.when('/myzoots', {templateUrl: 'views/myzoots.html', controller: 'Zoots'});
      $routeProvider.otherwise({redirectTo: '/settings'});
    }
  ]).directive('bootstrapTooltip', function () {
    return {
      link: function (scope, element, attrs) {
        $(element).tooltip({
          title: function () {
            return attrs.bootstrapTooltip;
          }
        });
      }
    };
  }).directive('clickableLink', function () {
    return {
      link: function (scope, element, attrs) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        $(element).html(attrs.clickableLink.replace(exp, '<a href=\'$1\'  target=\'_blank\'>$1</a>'));
      }
    };
  }).directive('eyeCheckbox', function () {
    return {
      link: function (scope, element, attrs) {
        $(element).click(function () {
          $(element).siblings('span').toggleClass('tgl-cb');
        });
      }
    };
  }).directive('enter', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          event.preventDefault();
        }
      });
    };
  });