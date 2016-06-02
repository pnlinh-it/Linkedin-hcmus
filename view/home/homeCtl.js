var myApp = angular.module('myApp');
myApp.controller('homeCtl', function ($mdDialog, HomeFactory) {


    var self = this;

    self.data = {};
    self.showAvatar = false;
    self.name = 's';
    self.showLine = "";


    self.data = HomeFactory.getData().then(function (data)
    {
        console.log(data);
        var overview = data.overview;
        self.data = data;
        if (checkUn(overview.img))
            self.showAvatar = true;
        if (!checkUn(overview.place) && !checkUn(overview.phone))
            self.showLine = "|";
        self.name = getName(self.data.overview.name).trim();

    });





    self.showEdit = function (ev, template, data, isAdd) {
        var templatePath = "template/" + template;
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: templatePath,
            parent: parentEl,
            locals: {
                data: data,
                isAdd: isAdd,
                HomeFactory: HomeFactory

            },
            targetEvent: ev,
        }).then(function (data) {
            console.log(data);

        }, function () {

        });
    };


});
myApp.controller('DialogController', function ($scope, $mdDialog, data, isAdd, HomeFactory, ToastFactory, $timeout) {


    $scope.isAdd = isAdd;
    $scope.uploading = false;
    if (isAdd)
    {
        $scope.dialogData = {};
    } else
        $scope.dialogData = angular.copy(data);
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.check = function (test) {
        return angular.isUndefined(test);
    };
    $scope.onOK = function (dataReturn) {

        if (isAdd)
        {
            data.$add(dataReturn);
        } else
            angular.copy(dataReturn, data);

        HomeFactory.updateOverview(data).then(function () {
            $mdDialog.hide(data);
            ToastFactory.show("Save Complete");
        });

    };

    $scope.setFile = function (element) {

        $timeout(function () {
            $scope.uploading = true;
        }, 1);

        $scope.currentFile = element.files[0];

        var result = HomeFactory.uploadImage($scope.currentFile);
        result.then(function (url) {

            $timeout(function () {
                $scope.uploading = false;
                $scope.dialogData.img = url;
            }, 1);
        });
    };
    $scope.uploadClick = function () {
        var el = document.getElementById('upload');
        el.click();


    };


});

function  showDialog(ev, title, msg, $mdDialog)
{
    $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(title)
            .textContent(msg)
            .ariaLabel('Alert Dialog Demo')
            .ok('OK')
            .targetEvent(ev)
            );
}





function getName(name) {
    if (!name)
        return "";
    var i = name.lastIndexOf(' ');

    if (i > 0)
    {
        var i2 = name.lastIndexOf(' ', i - 1);

        if (i2 > 0)
            return name.substring(i2, name.length);
    }
    return name;

}
function checkUn(value) {
    return angular.isUndefined(value);
}