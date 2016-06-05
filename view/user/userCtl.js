angular.module('myApp').controller('userCtl', function ($scope, $routeParams, HomeFactory) {

  

    var vm = this;
    vm.id = $routeParams.id;
    vm.showAvatar = true;
    vm.name = "KK";
    vm.isAuther = false;

    vm.data = {};
//    vm.data.overview={};
//    vm.data.summary = [{}];
//    vm.data.experience = {};
//    vm.data.project = {};
//    vm.data.skill = {};
//    vm.data.education = {};
//    vm.data.volunteer = {};

    vm.listUn = {
        'summary': false,
        'experience': false,
        'project': false,
        'skill': false,
        'education': false,
        'volunteer': false
    };

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

