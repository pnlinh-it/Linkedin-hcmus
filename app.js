var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'ngLetterAvatar', 'pascalprecht.translate','angularFileUpload']);
app.constant('CONFIG', {
    apiKey: "AIzaSyA3gbSfQMhKENkz2m5xNgmUgxSwu91wS1I",
    authDomain: "linkedin-hcmus-b38e0.firebaseapp.com",
    databaseURL: "https://linkedin-hcmus-b38e0.firebaseio.com",
    storageBucket: "linkedin-hcmus-b38e0.appspot.com"

//    apiKey: "AIzaSyA0ReqsTDTj-ElTOcb0DKUOh32bPs9nUCc",
//    authDomain: "testauth-327b7.firebaseapp.com",
//    databaseURL: "https://testauth-327b7.firebaseio.com",
//    storageBucket: ""
});

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
        $translateProvider.preferredLanguage('vi');
    }]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: 'view/home/home.html',
            controller: 'homeCtl',
            controllerAs: 'homeCtl',
            resolve: {
                "check": ["AuthFactory", function (AuthFactory) {
                        return AuthFactory.requireAuth();
                    }]


            }
        }).when('/login', {
            templateUrl: 'view/login/login.html',
            controller: 'loginCtl',
            controllerAs: 'loginCtl'
        }).when('/logout', {
            template: 'Logout',
            resolve: {
                "check": ["AuthFactory", function (AuthFactory) {
                        return AuthFactory.logout();
                    }]
            }
        }).otherwise({redirectTo: '/'});

    }]);

app.run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
            if (error = "AUTH_REQUIRED") {
                console.log("Error in Auth");
                $location.path("/login");
            }
        });
    }]);

app.directive('editHover', function () {
    return {
        restrict: 'A',
        scope: {
            editHover: '@'
        },
        link: function (scope, element) {
            var child = angular.element(element[0].querySelector('.non-visible'));
            element.on('mouseenter', function () {
                child.addClass(scope.editHover);
            });
            element.on('mouseleave', function () {
                child.removeClass(scope.editHover);
            });
        }
    };
});


app.directive('uploadfile', function () {
    return {
      restrict: 'A',
      link: function(scope, element) {

        element.bind('click', function(e) {
            angular.element(e.target).siblings('#upload').trigger('click');
        });
      }
    };
});


app.controller('Ctrl', ['$scope', 'AuthFactory', '$window', function ($scope, AuthFactory, $window) {

    }]);
