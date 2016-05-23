
(function () {
    'use strict';

    angular.module('alumni.services', [])
    .factory('dateDiffService', [
        function () {
            return {
                inDays: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000));
                },
                inWeeks: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
                },
                inMonths: function (d1, d2) {
                    var d1Y = d1.getFullYear();
                    var d2Y = d2.getFullYear();
                    var d1M = d1.getMonth();
                    var d2M = d2.getMonth();

                    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
                },
                inYears: function (d1, d2) {
                    return d2.getFullYear() - d1.getFullYear();
                }
            };
        }
        ])
    .factory('routeAuthService', ['$rootScope', '$state', 'userService',
        function ($rootScope, $state, userService) {
            function isAuthRoute(toState) {
                return toState.hasOwnProperty('data') && toState.data.hasOwnProperty('authenticated') &&
                toState.data.authenticated;
            }

            return {
                registerRouteChangeListener: function () {
                    /* Register a route change listener */
                    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                        if (isAuthRoute(toState) && !userService.isLoggedIn()) {
                            event.preventDefault();
                            $state.go('login');
                        }
                        return;
                    });
                }
            }
        }
        ])
    .factory('userService', ['$http', '$q', 'appConfig', 'CacheFactory', '$httpParamSerializerJQLike','$ionicLoading',
        function ($http, $q, appConfig, CacheFactory, $httpParamSerializerJQLike,$ionicLoading) {
            var userCache, cacheKeys;
            (function () {
                if (!CacheFactory.get('userCache')) {
                    userCache = CacheFactory('userCache');
                    cacheKeys = {'phoneno': 'phoneno', 'api_key': 'api_key'};
                }
            })();

            function cacheUserInfo(phoneno, api_key) {
                userCache.put(cacheKeys.phoneno, phoneno);
                userCache.put(cacheKeys.api_key, api_key);
            }

            function clearCache() {

            }

            function isLoggedIn(user) {
                return userCache.get(cacheKeys.phoneno) == user.phoneno && userCache.get(cacheKeys.api_key);
            }

            return {
                createAccount: function (user) {
                    var deferred, resp;
                    deferred = $q.defer();

                    $http({
                        url: appConfig.apiUrl + 'register', 
                        method: 'POST',
                        data: user
                    })
                    .then(function (httpResponse) {
                        resp = httpResponse.data;
                        /* Log the user in automatically */
                        if (!resp.error) {
                            cacheUserInfo(resp.phoneno, resp.api_key);
                        }
                        deferred.resolve(resp);
                    }, function (httpResp) {
                        deferred.reject(httpResp);
                    });

                    return deferred.promise;
                },
                login: function (user) {
                    var deferred, resp;
                    deferred = $q.defer();

                    if (isLoggedIn(user))
                        deferred.resolve({error: false});
                    else {
                        $http.post(appConfig.apiUrl + 'login', user)
                        .then(function (httpResponse) {
                            resp = httpResponse.data;
                            if (!resp.error) {
                                cacheUserInfo(resp.phoneno, resp.api_key);
                            }
                            deferred.resolve(resp);
                        }, function (httpResp) {
                            deferred.reject(httpResp);
                        });
                    }

                    return deferred.promise;
                },
                getPhoneNumber: function () {
                    var names;
                    if (userCache.get(cacheKeys.phoneno)) {
                        names = (userCache.get(cacheKeys.phoneno)).split(" ");
                        return angular.isArray(names) && names.length > 0 ? names[0] : "";
                    }
                    return '';
                },
                isLoggedIn: function () {
                    if (userCache.get(cacheKeys.api_key))
                        return true;
                    return false;
                },
                logout: function () {
                    clearCache();
                },
                getApiKey: function () {
                    return userCache.get(cacheKeys.api_key);
                }
            }
        }
        ])
.factory('schoolService', ['$http', '$q', 'appConfig', 'CacheFactory', 'dateDiffService',
    'userService', '$httpParamSerializerJQLike',
    function ($http, $q, appConfig, CacheFactory, dateDiffService, userService, $httpParamSerializerJQLike) {
        var reportStatus, schoolCache, tempCache, schoolKeys;

        (function () {
            if (!CacheFactory.get('schoolCache')) {
                schoolCache = CacheFactory('schoolCache');
            }
            if (!CacheFactory.get('tempCache')) {
                /* Expire zones cache after 30 days */
                tempCache = CacheFactory('tempCache', {maxAge: 30 * 24 * 3600 * 1000});
            }
            schoolKeys = {'phone': 'AlumniPhone', 'binDate': 'AlumniDate'};
        })();

        return {


            getSchools: function () {
                var deferred, key, results;
                key = appConfig.apiUrl + 'schools';
                deferred = $q.defer();
                results = tempCache.get(key);
                if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },

                    getIndustries: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'industries';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },

                    getCategories: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'categoryworks';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },

                    getProducts: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'products';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },
                    getProductCategories: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'productcategories';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },
                    getRegions: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'regions';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },
                    getCities: function () {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'cities';
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },
                    getProduct: function (id) {
                        var deferred, key, results;
                        key = appConfig.apiUrl + 'products/'+id;
                        deferred = $q.defer();
                        results = tempCache.get(key);
                        if(0){
                        // if (angular.isArray(results) && results.length > 0) {
                            deferred.resolve(results);
                        } else {
                            $http({
                                url: key,
                                method: 'GET',
                                headers: {'Alumni': userService.getApiKey()}
                            }).success(function (response) {
                                tempCache.put(key, response);
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });
                        }

                        return deferred.promise;
                    },

                    uploadFile:function(file,folder,onRetrieve){
                        var url = config.uploadService+"/"+folder;
                        var frmData=new FormData();
                        frmData.append("fileToUpload",file);
                        frmData.append("folder",folder);
                        return $.ajax({
                            url: url,
                            type:"POST",
                            contentType: false,
                            data: frmData,
                            processData:false,
                            cache:false,
                            timeout:600000,
                            success: function (data) {
                                onRetrieve(data, false);
                            },
                            error: function (data) {
                                onRetrieve(data, true);
                            }
                        });
                    },
                    createProduct: function (product) {
                        var deferred, resp;
                        deferred = $q.defer();

                        $http({
                            url: appConfig.apiUrl + 'products', 
                            method: 'POST',
                            data: product
                        })
                        .success(function (response) {
                                
                                deferred.resolve(response);
                            }).error(function (resp) {
                                deferred.reject(resp);
                            });                        

                        return deferred.promise;
                    },
                };
            }
            ]);
})();
