angular.module('myApp').controller('userCtl', function ($routeParams, HomeFactory, friendState, $scope, $timeout, $location) {

    var vm = this;
    vm.id = $routeParams.id;
    vm.canSendMessage = false;
    vm.showAvatar = true;
    vm.name = "L";
    vm.isAuther = false;
    vm.friendState = friendState;
    vm.colsize = '8';
    vm.isCanAddFriend = true;
    if (vm.friendState === 3)
        vm.canSendMessage = true;

    console.log(friendState)

    if (HomeFactory.uid === vm.id)
        vm.isCanAddFriend = false;


    vm.addFriIcon = "person_add";
    vm.test = true;
    switch (friendState) {
        case 0:
            vm.addFriIcon = "person_add";
            break;
        case 1:
        case 2:
            vm.addFriIcon = "more_horiz";
            break;
        case 3:
            vm.addFriIcon = "check";
            break;

    }
    vm.goMessage = function () {
        var s = '/message/' + vm.id;
        $location.url(s);
    }
    vm.friendHandle = function (id) {
        if (id === null)
        {
            vm.addFriIcon = "person_add";
            vm.friendState = 0;

        }
        if (id == 3)
        {
            vm.addFriIcon = "check";
            vm.friendState = 3;
        }
        if (id == 1)
        {
            vm.addFriIcon = "more_horiz";
            vm.friendState = 1;
        }
        console.log(vm.id);
        console.log(id);
        HomeFactory.friendHandle(id, vm.id);

    }

    $scope.$on('friendChanged', function (event, data) {
        console.log('friendChanged');
        if (data.key === vm.id) {
            vm.friendState = 3;
            document.getElementById('friendic').innerHTML = 'check';
        }
    });
    $scope.$on('friendAdd', function (event, data) {
        console.log('friendAdd');
        if (data.key === vm.id) {
            vm.friendState = data.val();
            document.getElementById('friendic').innerHTML = 'more_horiz';
        }
    });

    $scope.$on('friendRemove', function (event, data) {
        console.log('friendRemove');
        if (data.key === vm.id) {
            vm.friendState = 0;
            document.getElementById('friendic').innerHTML = 'person_add';
        }
    });


    vm.data = {};
    vm.listUn = {
        'summary': false,
        'experience': false,
        'project': false,
        'skill': false,
        'education': false,
        'volunteer': false
    };
    vm.addFriend = function () {
        console.log('addfriend')
        HomeFactory.addFriend(vm.id);
    }

    vm.checkUn = function (value) {
        return angular.isUndefined(value);
    }
    HomeFactory.getDataById(vm.id, 'overview').then(function (result)
    {
        vm.data.overview = result;
        if (!checkOK(vm.data.overview.img) || vm.data.overview.img.trim().length < 1)
            vm.showAvatar = false;
        if (!vm.checkUn(vm.data.overview.place) && !vm.checkUn(vm.data.overview.phone))
            vm.showLine = "|";
        vm.name = getName(vm.data.overview.name).trim();
    });

    angular.forEach(vm.listUn, function (value, key) {
        HomeFactory.getDataById(vm.id, key).then(function (result) {
            if (checkOK(result)) {
                vm.data[key] = result;
                vm.listUn[key] = true;
            }
        });
    });

});

