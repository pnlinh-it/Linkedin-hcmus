var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'ngLetterAvatar']);

app.constant('CONFIG', {
    apiKey: "AIzaSyA3gbSfQMhKENkz2m5xNgmUgxSwu91wS1I",
    authDomain: "linkedin-hcmus-b38e0.firebaseapp.com",
    databaseURL: "https://linkedin-hcmus-b38e0.firebaseio.com",
    storageBucket: "linkedin-hcmus-b38e0.appspot.com"
});

app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('red');
});



app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: 'view/home/home.html',
            controller: 'homeCtl',
            controllerAs: 'homeCtl',
            resolve: {
                "check": function (AuthFactory, $q, HomeFactory) {
                    var defer = $q.defer();
                    AuthFactory.requireAuth()
                            .then(function () {
                                HomeFactory.getUser().then(function () {
                                    defer.resolve();
                                });
                            })
                            .catch(function (result) {
                                defer.reject(result);
                            });
                    return defer.promise;
                }
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
        }).when('/user/:id', {
            templateUrl: 'view/home/home.html',
            controller: 'userCtl',
            controllerAs: 'homeCtl',
            resolve: {
                "friendState": function (HomeFactory, $q, $route) {
                    var defer = $q.defer();
                    HomeFactory.checkFriend($route.current.params.id)
                            .then(function (result) {
                                defer.resolve(result);
                            });
                    return defer.promise;
                }
            }
        }).when('/message/:id', {
            templateUrl: 'view/message/message.html',
            controller: 'msgCtl',
            controllerAs: 'msgCtl'
        }).when('/message', {
            templateUrl: 'view/message/message.html',
            controller: 'msgCtl',
            controllerAs: 'msgCtl'
        }).otherwise({redirectTo: '/'});

    }]);

app.run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });
    }]);

app.directive('editHover', function () {
    return {
        restrict: 'A',
        scope: {
            editHover: '@',
            isauther: '='
        },
        link: function (scope, element) {
            var child = angular.element(element[0].querySelector('.non-visible'));
            if (scope.isauther) {
                element.on('mouseenter', function () {
                    child.addClass(scope.editHover);
                });
                element.on('mouseleave', function () {
                    child.removeClass(scope.editHover);
                });
            }
        }
    };
});


app.directive('uploadfile', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {

            element.bind('click', function (e) {
                angular.element(e.target).siblings('#upload').trigger('click');
            });
        }
    };
});


app.controller('Ctrl', function ($scope, $q, $timeout, AuthFactory, HomeFactory, $window, ToastFactory, $location, $rootScope) {


    var vm = this;

    vm.showSearch = false;
    vm.toggleSearch = function () {
        vm.showSearch = !vm.showSearch;
    }
    vm.simulateQuery = false;
    vm.isDisabled = false;
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    function querySearch(query) {
        return HomeFactory.searchUser(query).then(function (result) {
            var data = [];
            var ids = Object.keys(result);
            angular.forEach(ids, function (id) {
                var item = {};
                item.id = id;
                item.data = result[id].overview;
                item.letter = getName(item.data.name).trim();
                item.isImg = checkImgOK(item.data.img);
                data.push(item);
            })
            return data;
        });
    }
    function searchTextChange(text) {
    }
    function selectedItemChange(item) {
    }
    vm.auth = AuthFactory.getAuth();
    vm.database = HomeFactory.getDatabase();
    vm.email = "";
    vm.img = "";
    vm.showAvatar = true;
    vm.name = "";
    vm.listMessage = [];
    vm.listRequestFriend = [];

    vm.isShowListFriend = false;
    vm.isShowListMessage = false;

    vm.auth.onAuthStateChanged(function (user) {
        if (user) {
            vm.isLogin = true;
            vm.database.ref('users/' + user.uid + '/overview').on('value', function (snapshot) {
                var data = snapshot.val();
                $timeout(function () {
                    vm.email = data.email;
                    vm.img = data.img;
                    if (angular.isUndefined(vm.img) || vm.img.trim().length < 1)
                        vm.showAvatar = false;
                    else
                        vm.showAvatar = true;
                    vm.name = getName(data.name).trim();
                }, 2);
            });


            var newItems = false;
            vm.database.ref('users/' + user.uid + '/messages').once('value', function (result) {
                newItems = true;
            });
            vm.database.ref('users/' + user.uid + '/messages').on('child_added', function (result) {
                if (newItems)
                    vm.receivedMessage(result, user);
            });

            vm.database.ref('users/' + user.uid + '/messages').on('child_changed', function (result) {
                if (newItems)
                    vm.receivedMessage(result, user);
            });


            var newAddFriend = false;
            vm.database.ref('friends/' + user.uid).once('value', function (result) {
                newAddFriend = true;
            });

            vm.database.ref('friends/' + user.uid).on('child_added', function (result) {
                if (newAddFriend)
                {
                    if (result.val() === 2) {
                        HomeFactory.getDataById(result.key, 'overview').then(function (data) {
                            ToastFactory.showCustom(data.name + " send you a request!", result.key, 'user');
                        })
                    }
                    $rootScope.$broadcast('friendAdd', result);
                }
            });
            vm.database.ref('friends/' + user.uid).on('child_changed', function (result) {
                if (newAddFriend)
                {
                    HomeFactory.getDataById(result.key, 'overview').then(function (data) {
                        ToastFactory.showCustom("You and " + data.name + " now are friend", result.key, 'user');
                        $rootScope.$broadcast('friendChanged', result);
                    })

                }
            });
            vm.database.ref('friends/' + user.uid).on('child_removed', function (result) {
                if (newAddFriend)
                {
                    $rootScope.$broadcast('friendRemove', result);

                }
            });
        } else
        {
            vm.isLogin = false;
            $window.location.href = "#/#";
        }
    });


    vm.openMenu = function ($mdOpenMenu, ev) {
        vm.listMessage = [];
        $mdOpenMenu(ev);
        vm.isShowListMessage = false;
        HomeFactory.getListMessage().then(function (data) {
            if (data !== null && data.length > 0)
            {
                vm.isShowListMessage = true;
                vm.listMessage = data;
            } else
                vm.isShowListMessage = true;

        });
    };

    vm.openMenuFriend = function ($mdOpenMenu, ev) {
        vm.listRequestFriend = [];
        $mdOpenMenu(ev);
        vm.isShowListFriend = false;
        HomeFactory.getListFriend(2).then(function (result) {
            if (result !== null) {
                HomeFactory.getListUserFromUid(result).then(function (listFri) {

                    if (listFri !== null) {
                        vm.isShowListFriend = true;
                        angular.forEach(listFri, function (user) {
                            user.letter = getName(user.name).trim();
                            user.isImg = checkImgOK(user.img);
                            user.isFriend = false;
                            vm.listRequestFriend.push(user);
                        })
                    }

                })
            } else
                vm.isShowListFriend = true;

        }).catch(function (data) {
            console.log(data);
        });
    };

    vm.addFriend = function (user) {
        if (user.isFriend)
            HomeFactory.friendHandle(3, user.uid);
        else
            HomeFactory.friendHandle(null, user.uid);


    }

    vm.receivedMessage = function (result, user) {
        var userKey = result.key;
        vm.database.ref('users/' + user.uid + '/messages/' + userKey).limitToLast(1).once('value', function (result) {

            for (var key in result.val())
            {
                var mes = result.val()[key];
                HomeFactory.getDataById(userKey, 'overview').then(function (data) {
                    var path = $location.path();
                    var index = path.indexOf('/message')
                    if (index < 0)
                        ToastFactory.showCustom(data.name + ": " + mes.message, userKey, 'message');
                })
                break;
            }
        });
    }



    vm.gotoMessage = function (id) {
        var s = '/message/' + id.trim();
        $location.url(s);
    }
    vm.gotoUser = function (id) {
        var s = '/user/' + id.trim();
        $location.url(s);
    }

});

function checkImgOK(value) {
    if (checkOK(value) && value.length > 1)
        return true;
    return false;
}

