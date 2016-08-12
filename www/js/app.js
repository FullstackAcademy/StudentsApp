// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });

  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: '<p>Loading...</p><ion-spinner></ion-spinner>'});
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });
})

.factory('authInterceptor', function($rootScope, $q, $location) {
    return {
      // Add authorization token to headers
      request: function(config) {
        config.headers = config.headers || {};
        if ($rootScope.token) {
          console.log("Token in request", $rootScope.token);
          config.headers.Authorization = 'Bearer ' + $rootScope.token;
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        // window.localStorage.clear();
        // var resetReg = new RegExp('/reset/', 'g')

        if(response.status === 401 ) {
        //   // don't redirect on /login or /signup since these still generate 401 errors
        //   // but we want to stay on that page generally
          if ( $location.path() !== '/login' ) {
            $location.path('/login');
          }
          return $q.reject(response);

        //     if(!$rootScope.returnTo) {
        //       // don't store a return to login and don't override it if we've already set it
        //       $rootScope.returnTo = $location.url();
        //     }
        //     $location.path('/login');
        //     // remove any stale tokens
        //     $localstorage.set('token', undefined);
        //   }
        //   return $q.reject(response);
        // } else {
        //   return $q.reject(response);
        }
      }
    };
  })
  .config(function($stateProvider, $httpProvider, $urlRouterProvider) {

    $httpProvider.interceptors.push('authInterceptor');

    // http://learn.ionicframework.com/formulas/loading-screen-with-interceptors/
    $httpProvider.interceptors.push(function($rootScope) {
      return {
        request: function(config) {
          $rootScope.$broadcast('loading:show');
          return config;
        },
        response: function(response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        }

      };
    });
    // http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
    function authenticate($q, $rootScope, $state, $timeout) {
      if(window.localStorage['token']) {
        console.log("Using localStorage token");
        $rootScope.token = window.localStorage['token'];
      }
      if($rootScope.token) {
        return $q.when();
      } else {
        $timeout(function() {
          $state.go('login');
        });
        return $q.reject();
      }
    }

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

    // setup an abstract state for the tabs directive
      .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.cohorts', {
      url: '/cohorts',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-cohorts.html',
          controller: 'CohortsCtrl'
        }
      },
      resolve: {
        authenticate: authenticate
      }
    })
    .state('tab.cohort-detail', {
      url: '/cohorts/:cohortId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/cohort-list.html',
          controller: 'CohortMemberListCtrl'
        }
      }
    })

    .state('tab.student', {
      url: '/student/:studentId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/student-detail.html',
          controller: 'StudentCtrl',
        }
      },
      resolve: {
        authenticate: authenticate
      }

    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

  });
