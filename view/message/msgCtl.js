angular.module('myApp').controller('msgCtl', function (HomeFactory, $scope, $timeout, $routeParams) {
    var vm = this;
    vm.friendList = [];
    vm.messages = {};
    vm.curUser = {};
    vm.curFri = {};
    vm.msgSend = '';
    vm.database = HomeFactory.getDatabase();
    vm.id = $routeParams.id;
    console.log(vm.id);

    HomeFactory.getCurentUser().then(function (data) {
        vm.curUser = data;
    })

    HomeFactory.getListFriend(3).then(function (result) {
        if (result != null) {
            HomeFactory.getListUserFromUid(result).then(function (listFri) {
                angular.forEach(listFri, function (user) {
                    user.letter = getName(user.name).trim();
                    user.isImg = checkImgOK(user.img);
                    vm.friendList.push(user);
                    if (!angular.isUndefined(vm.id)) {
                        var keepGoing = true;
                        angular.forEach(vm.friendList, function (fri) {
                            if (keepGoing) {
                                if (fri.uid === vm.id)
                                {
                                    vm.getConversation(fri);
                                    keepGoing = false;
                                }
                            }
                        })

                    }
                })
            })
        }
    }).catch(function (data) {
        console.log(data);
    });
    vm.getData = function (isfrome, key) {
        if (isfrome)
            return vm.curUser[key];
        else
            return vm.curFri[key];
    };
    vm.getConversation = function (friend) {
        vm.messages = {}
        vm.curFri = friend;
        var path = 'messages/' + friend.uid;
        HomeFactory.getDataById(vm.curUser.uid, path).then(function (result) {

            if (result !== null)
                vm.messages = result;
            else
                vm.messages = {};
            vm.database.ref('users/' + vm.curUser.uid + '/messages/' + friend.uid).on('child_added', function (result, re) {
                $timeout(function () {
                    vm.messages[result.key] = result.val();
                    $scope.$apply()
                }, 1);
            });
        });
    };

    vm.isImg = function (item) {
        var img = "";
        if (item.isFromMe)
            img = vm.curUser.img;
        else
            img = vm.curFri.img;
        if (!angular.isUndefined(img) && img.length > 0)
            return true
        return false;
    }

    vm.getLetter = function (item) {
        if (item.isFromMe)
            return getName(vm.curUser.name).trim();
        else
            return getName(vm.curFri.name).trim();
    }

    vm.sendMessage = function () {
        console.log(vm.msgSend);
        if (!angular.isUndefined(vm.curFri.uid) && vm.msgSend.length > 0)
        {
            HomeFactory.sendMessage(vm.msgSend, vm.curFri.uid);
            vm.msgSend = "";
        }
    };





});





