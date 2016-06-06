angular.module('myApp').factory('AuthFactory', ['CONFIG', '$q', function (CONFIG, $q) {

        var AuthFactory = {};
        firebase.initializeApp(CONFIG);
        var auth = firebase.auth();
        var database = firebase.database();
        AuthFactory.getAuth = function () {
            return auth;
        }

        AuthFactory.setUidFb = function (uid, fbId) {
            console.log(uid);
            console.log(fbId);
            var defer = $q.defer();
            var updates = {};
            updates['/facebooks/' + uid] = fbId;
            database.ref().update(updates);
            defer.resolve();
            return defer.promise;
        };
        AuthFactory.setFbTokent = function (token) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                {
                    var update = {};
                    update['users/' + user.uid + '/overview/token'] = token;
                    database.ref().update(update).then(function () {
                        defer.resolve();
                    }).catch(function () {
                        defer.reject();
                    })
                }
            })
            return defer.promise;
        }
        AuthFactory.addNewUser = function (fullname) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                {
                    if (fullname == null)
                        fullname = user.displayName;
                    var searchFullName = fullname.toLowerCase();
                    var searchReversedFullName = searchFullName.split(' ').reverse().join(' ');
                    try {
                        searchFullName = latinize(searchFullName);
                        searchReversedFullName = latinize(searchReversedFullName);
                    } catch (e) {
                        console.error(e);
                    }

                    var userSave = {
                        name: fullname,
                        img: user.photoURL,
                        email: user.email,
                        uid: user.uid,
                        _search_index: {
                            full_name: searchFullName,
                            reversed_full_name: searchReversedFullName
                        }
                    }
                    console.log(userSave);
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

            if (pro.localeCompare("fb") == 0)
            {
                provider = new firebase.auth.FacebookAuthProvider();
                provider.addScope('user_birthday');
                provider.addScope('user_friends');
            } else
                provider = new firebase.auth.GithubAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function (user) {

                auth.fetchProvidersForEmail(user.user.email).then(function (providers) {
                    database.ref('users/' + user.user.uid + '/overview').once('value').then(function (snapshot) {

                        if (snapshot.val() == null) {

                            AuthFactory.addNewUser(null).then(function () {

                                if (pro.localeCompare("fb") == 0) {
                                    try {
                                        AuthFactory.setUidFb(user.user.uid, user.user.providerData[0].uid)
                                                .then(function () {
                                                    defer.resolve(user);
                                                })
                                    } catch (err) {
                                        console.log(err);
                                    } finally {
                                        defer.resolve(user);
                                    }
                                } else {
                                    defer.resolve(user);

                                    return defer.promise;
                                }
                            });
                        } else {


                            defer.resolve(user);

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

