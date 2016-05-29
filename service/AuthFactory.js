angular.module('myApp').factory('AuthFactory', ['CONFIG', '$q', function (CONFIG, $q) {

        var AuthFactory = {};
        firebase.initializeApp(CONFIG);
        var auth = firebase.auth();

        AuthFactory.signup = function (email, password) {
            return auth.createUserWithEmailAndPassword(email, password);
        }

        AuthFactory.login = function (email, password) {
            return auth.signInWithEmailAndPassword(email, password);
        }

        AuthFactory.logout = function () {
            firebase.auth().signOut().then(function () {
                console.log("Logout Successed");
            }, function (error) {
                console.log(error);
            });
        };

        AuthFactory.check = function () {
            auth.onAuthStateChanged(function (user) {
                if (user) {
                    console.log("Change OK");
                } else {
                    console.log("Change NoOK");
                }

            });
        };

        AuthFactory.requireAuth = function () {
            var defer = $q.defer();
            auth.onAuthStateChanged(function (user) {
                if (user)
                    defer.resolve("OK");
                else
                    defer.reject("AUTH_REQUIRED")

            });
            return defer.promise;
        };


        AuthFactory.gg = function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/plus.login');

            firebase.auth().signInWithPopup(provider).then(function (result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                console.log(result);
                // ...
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
        };


        return AuthFactory;
    }]);

