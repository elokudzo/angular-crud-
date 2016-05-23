
var app = angular.module('alumniapp', ['ionic','ui.select','alumni.controllers','alumni.services','angular-cache','ionic.wizard','ngCordova']);


(function(){

 // app.constant('appConfig', {apiUrl: 'http://localhost/alumni/api/v1/'})
 app.constant('appConfig', {apiUrl: 'http://admin.alumnighana.com/api/v1/'})
//routing part
app.run(function ($ionicPlatform, $ionicLoading,$rootScope,$ionicPopup) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }

               if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
    

 $ionicPopup.confirm({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });

        
      }
    }



            });

            $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: '<p class="item-icon-left">Loading ...<ion-spinner icon="lines"/></p>'})
  })

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  })
        })
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);
        
      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response;
      }
    }
  })
})
app.config(['CacheFactoryProvider', function (CacheFactoryProvider) {
            /* Items expire after 1 month */
            angular.extend(CacheFactoryProvider.defaults, {
                maxAge: 30 * 24 * 3600 * 1000,
                storageMode: 'localStorage'
            });
        }])
        app.config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.headers.common["X_REQUESTED_WITH"] = 'XMLHttpRequest';
        }])
        /* Register application routes */
        app.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
            defineRoutes($stateProvider, $urlRouterProvider);
        }])
        app.run(['routeAuthService', function(routeAuthService) {
            routeAuthService.registerRouteChangeListener();
        }]);

function defineRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl as loginCtrl'
            })
            .state('messages', {
                url: '/messages',
                templateUrl: 'templates/messages.html'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'templates/settings.html'
            })
             .state('messagedetails', {
                url: '/messagedetails',
                templateUrl: 'templates/messagedetails.html'
            })
            .state('eventdetails', {
                url: '/eventdetails',
                templateUrl: 'templates/eventdetails.html'
            })
            .state('register_one', {
                url: '/register_one',
                templateUrl: 'templates/register_one.html',
                controller: 'RegisterOneCtrl as registerCtrl',
                resolve: {
                    schools: ['schoolService', function(schoolService) {
                        return schoolService.getSchools();
                    }]
                }


            })

            .state('register_two', {
                url: '/register_two',
                templateUrl: 'templates/register_two.html',
                controller: 'RegisterTwoCtrl as registerCtrl',
                
                resolve: {
                 
                    industries: ['schoolService', function(schoolService) {
                        return schoolService.getIndustries();
                    }],
                    categories: ['schoolService', function(schoolService) {
                        return schoolService.getCategories();
                    }]
                }


            })
            .state('register_three', {
                url: '/register_three',
                templateUrl: 'templates/register_three.html',
                controller: 'RegisterCtrl as registerCtrl',
                  
            })
            .state('events', {
                url: '/events',
                templateUrl: 'templates/events.html',
                controller: 'EventsCtrl as eventsCtrl',
                  
            })
            .state('home', {
                url: '/home',
                cache: false,
                templateUrl: 'templates/dashboard.html',
                controller: 'HomeCtrl as homeCtrl',
                resolve: {
                    username: ['userService', function(userService) {
                        return userService.getPhoneNumber();
                    }]
                }
            })

            .state('profiles', {
                url: '/profiles',
                templateUrl: 'templates/profiles.html',
               
            })
             .state('profile_description', {
                url: '/profile_description',
                templateUrl: 'templates/profile_description.html',
                controller: 'LoginCtrl as loginCtrl'
            })
            .state('resetpass', {
                url: '/resetpass',
                templateUrl: 'templates/resetpass.html',
                
            })
             .state('profile_members', {
                url: '/profile_members',
                templateUrl: 'templates/profile_members.html',
                
            })

               .state('profile_info', {
                url: '/profile_info',
                templateUrl: 'templates/profile_info.html',
                
            })


               .state('singlechat', {
                url: '/singlechat',
                templateUrl: 'templates/singlechat.html',
                
            })

                .state('groupchat', {
                url: '/groupchat',
                templateUrl: 'templates/groupchat.html',
                
            })
              .state('market', {
                url: '/market',
                cache: false,
                templateUrl: 'templates/market.html',
               controller: 'MarketCtrl',
                resolve: {
                   
                 products: ['schoolService', function(schoolService) {
                        return schoolService.getProducts();
                    }]                                      
                }
            })
              .state('product_detail', {
                url: '/product/:id',
                cache: false,
                templateUrl: 'templates/product_detail.html',
               controller:"MarketProductCtrl as marketProductCtrl",
               resolve: {
                   
                 product: ['schoolService','$stateParams', function(schoolService,$stateParams) {
                        return schoolService.getProduct($stateParams.id);
                    }]                                      
                }
            })

            .state('addproduct', {
                url: '/addproduct',
                templateUrl: 'templates/addproduct.html',
                controller: 'NewProductCtrl as newProductCtrl',
                
                resolve: {
                   
                 cities: ['schoolService', function(schoolService) {
                        return schoolService.getCities();
                    }],
                    categories: ['schoolService', function(schoolService) {
                        return schoolService.getProductCategories();
                    }]
                    
                }


            })


           ;

        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get("$state");
            var userService = $injector.get("userService");

            if (!userService.isLoggedIn())
                $state.go('login');
            else 
                $state.go('home');
            return;
        });
    }

}());


