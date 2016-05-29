var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngMessages','pascalprecht.translate']);
app.constant('CONFIG', {
    apiKey: "AIzaSyA3gbSfQMhKENkz2m5xNgmUgxSwu91wS1I",
    authDomain: "linkedin-hcmus-b38e0.firebaseapp.com",
    databaseURL: "https://linkedin-hcmus-b38e0.firebaseio.com",
    storageBucket: "" });

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('red');
});

app.config(['$translateProvider', function ($translateProvider) {

        $translateProvider.useStaticFilesLoader({
            prefix: 'data/language/locale-',
            suffix: '.json'
        });
        // load 'en' table on startup
        $translateProvider.preferredLanguage('vi');
    }]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            template: 'Home',
            resolve: {
                "check": ["AuthFactory", function (AuthFactory) {
                        return AuthFactory.requireAuth();
                    }]
            }

        }).when('/login', {
           templateUrl: 'view/login/login.html',
            controller: 'loginCtl',
            controllerAs: 'loginCtl'
        }).otherwise({redirectTo: '/'});
    }]);

app.run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
            if (error = "AUTH_REQUIRED") {
                console.log("Error in Auth");
                $location.path("/login");
            }
        })
    }]);
app.controller('Ctrl', ['$translate', '$scope', 'AuthFactory', '$window', function ($translate, $scope, AuthFactory, $window) {
        $scope.login = function () {
            var result = AuthFactory.login();
            result.then(function (authData) {
                console.log(authData);
                $window.location.href = "#/#";
            }).catch(function (error) {
                console.log(error);
            });
        };
        $scope.logout = function () {
            AuthFactory.logout();
        };
        $scope.check = function () {

            AuthFactory.check();
        };
    }]);