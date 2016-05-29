angular.module('myApp').controller('loginCtl', ['$mdDialog', 'AuthFactory', '$window', function ($mdDialog, AuthFactory, $window) {



        var self = this;
        self.showSignIn = true;
        self.passMatch = false;

        self.signUp = function (ev) {

            if (self.password.localeCompare(self.rePassword) != 0)
                self.passMatch = true;
            else
            {
                self.passMatch = false;
                var result = AuthFactory.signup(self.email, self.password);
                result.then(function (userData) {
                    showDialog(ev, 'Infomation', 'Create Account Success. Please Login', $mdDialog);
                    self.loginEmail = self.email;
                    self.showSignIn = !self.showSignIn;
                    console.log(userData);
                }).catch(function (error) {
                    showDialog(ev, 'Error', error.toString(), $mdDialog);
                    console.log(error);
                });
            }
        };

        self.login = function (ev) {
            var result = AuthFactory.login(self.loginEmail, self.loginPassword);
            result.then(function (authData) {
                $window.location.href = "#/#";
                console.log(authData);
            }).catch(function (error) {
                console.log(error);
                showDialog(ev, 'Error', error.toString(), $mdDialog);
            });
        };

        //AuthFactory.gg();

    }]);

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