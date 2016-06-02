angular.module('myApp').controller('loginCtl', ['$mdDialog', 'AuthFactory', '$window', function ($mdDialog, AuthFactory, $window) {

        var self = this;
        self.showSignIn = true;
        self.passMatch = true;



        var po = document.createElement('script');
        po.onload = function () {
            gapi.load('auth2', function () {
                auth2 = gapi.auth2.init({
                    client_id: '756227301628-v5pagfiq69uj64lid9ai54hfm1iv7omr.apps.googleusercontent.com',
                    cookiepolicy: 'single_host_origin',
                    'scope': 'https://www.googleapis.com/auth/plus.login',
                });
                auth2.attachClickHandler(document.getElementById('btn-google'), {},
                        function (googleUser) {
                            var result = AuthFactory.loginWithGoogle(googleUser);
                            result.then(function (user) {

                                console.log("Login with google Successed");
                                $window.location.href = "#/#";
                            }).catch(function (error) {
                                showDialog(null, 'Error', error.toString(), $mdDialog);
                            });

                        }, function (error) {
                    alert(JSON.stringify(error, undefined, 2));
                });
            });
        };
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(po, s);



        self.signUp = function (ev) {

            if (self.password.localeCompare(self.rePassword) != 0)
                self.passMatch = false;
            else
            {
                self.passMatch = true;
                var result = AuthFactory.signup(self.fullname, self.email, self.password);
                result.then(function (userData) {
                    $window.location.href = "#/#";
                }).catch(function (error) {
                    showDialog(ev, 'Error', error.toString(), $mdDialog);
                    console.log(error);
                });
            }
        };


        self.login = function (ev) {
            var result = AuthFactory.login(self.loginEmail, self.loginPassword);
            console.log(result);
            result.then(function (authData) {
                $window.location.href = "#/#";
            }).catch(function (error) {
                console.log(error);
                showDialog(ev, 'Error', error.toString(), $mdDialog);
            });
        };



        self.loginWithFacbook = function (ev) {
            var result = AuthFactory.loginWithPopup("fb");
            result.then(function (result) {
                console.log("Login Successed");
                $window.location.href = "#/#";
            }).catch(function (error) {
                showDialog(ev, 'Error', error.toString(), $mdDialog);
            });
        };




        self.loginWithGithub = function (ev) {
            var result = AuthFactory.loginWithPopup("gh");
            result.then(function (result) {
                $window.location.href = "#/#";
                console.log("Login Successed");
            }).catch(function (error) {
                showDialog(ev, 'Error', error.toString(), $mdDialog);
            });
        };
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

