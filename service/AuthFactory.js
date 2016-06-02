angular.module('myApp').factory('AuthFactory', ['CONFIG', '$q', function (CONFIG, $q) {

        var AuthFactory = {};
        firebase.initializeApp(CONFIG);
        var auth = firebase.auth();
        var database = firebase.database();
        AuthFactory.addNewUser = function (fullname) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                {
                    if (fullname == null)
                        fullname = user.displayName;
                    var userSave = {
                        name: fullname,
                        img: user.photoURL,
                        email: user.email
                    }
                    database.ref('users/' + user.uid + '/overview').set(userSave);
                    console.log('Set new data: ' + userSave);
                    defer.resolve();
                }
            });

            return defer.promise;
        }

        AuthFactory.signup = function (fullname, email, password) {
            var defer = $q.defer();
            auth.createUserWithEmailAndPassword(email, password).then(function (userData) {
                AuthFactory.addNewUser(fullname);
                defer.resolve(userData);
            }).catch(function (error) {
                defer.reject(error);
            });
            return defer.promise;
        };

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

        AuthFactory.requireAuth = function () {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                    defer.resolve("OK");
                else
                    defer.reject("AUTH_REQUIRED")
            });
            return defer.promise;
        };

        AuthFactory.signInWithCredential = function (user) {
            var credential = firebase.auth.GoogleAuthProvider.credential(
                    user.getAuthResponse().id_token);
            return firebase.auth().signInWithCredential(credential);
        }

        AuthFactory.loginWithGoogle = function (googleUser) {
            var defer = $q.defer();
            var email = googleUser.getBasicProfile().getEmail();
            auth.fetchProvidersForEmail(email).then(function (providers) {
                if (providers.length < 1)
                {
                    AuthFactory.signInWithCredential(googleUser)
                            .then(function (user) {
                                AuthFactory.addNewUser(null);
                                defer.resolve(user);
                            })
                            .catch(function (error) {
                                defer.reject("SignIn Error. Please try again!");
                            });
                } else
                {
                    if (providers[0] == 'google.com')
                    {
                        AuthFactory.signInWithCredential(googleUser)
                                .then(function (user) {
                                    defer.resolve(user);
                                })
                                .catch(function (error) {
                                    defer.reject("SignIn Error. Please try again!");
                                });
                    } else
                        defer.reject("The email address is already in use by another account");
                }
            });
            return defer.promise;

        };


        AuthFactory.loginWithPopup = function (pro) {
            var defer = $q.defer();
            var provider = {};
            console.log(pro);
            if (pro.localeCompare("fb") == 0)
                provider = new firebase.auth.FacebookAuthProvider();
            else
                provider = new firebase.auth.GithubAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function (user) {
                console.log(provider);
                auth.fetchProvidersForEmail(user.user.email).then(function (providers) {
                    database.ref('users/' + user.user.uid + '/overview').once('value').then(function (snapshot) {
                        console.log("Start check uid exist");
                        if (snapshot.val() == null) {
                            console.log("Uid not exist. Start save");
                            AuthFactory.addNewUser(null).then(function () {
                                defer.resolve(user);
                                return defer.promise;
                            });
                        } else {
                            defer.resolve(user);
                            console.log("Uid exist");
                        }
                    });
                });
            }).catch(function (error) {
                defer.reject(error);
            });
            return defer.promise;
        };



        return AuthFactory;
    }]);

