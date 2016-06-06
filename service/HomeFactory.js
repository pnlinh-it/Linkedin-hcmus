angular.module('myApp').factory('HomeFactory', ['CONFIG', '$q', '$rootScope', '$http', function (CONFIG, $q, $rootScope, $http) {


        var HomeFactory = {};
        HomeFactory.data = {};
        HomeFactory.data.summary = [{}];
        HomeFactory.data.experience = {};
        HomeFactory.data.project = {};
        HomeFactory.data.skill = {};
        HomeFactory.data.education = {};
        HomeFactory.data.volunteer = {};
        firebase.initializeApp(CONFIG, "home");
        var auth = firebase.auth();
        var database = firebase.database();
        var storage = firebase.storage();
        var curUser = {};




        HomeFactory.getUser = function () {
            console.log('start get user');
            var defer = $q.defer();
            auth.onAuthStateChanged(function (user) {
                curUser = user;
                console.log('get user OK');
                HomeFactory.uid = user.uid;
                database.ref('friends/' + curUser.uid).on('child_changed', function (result) {
                    HomeFactory.getDataById(result.key, 'overview').then(function (data) {
                        data.uid = result.key;
                        $rootScope.$broadcast('friendChange', data);
                    });
                });
                database.ref('friends/' + curUser.uid).on('child_added', function (result) {
                    var data = {};
                    data.uid = result.key;
                    data.value = result.val();
                    if (data.value == 2) {
                        HomeFactory.getDataById(data.uid, 'overview').then(function (rs) {
                            data.name = rs.name;
                            $rootScope.$broadcast('friendAdd', data);
                        });
                    } else
                        $rootScope.$broadcast('friendAdd', data);

                });
                database.ref('friends/' + curUser.uid).on('child_removed', function (result) {
                    $rootScope.$broadcast('friendRemove', result);
                });
                defer.resolve();
            });
            return defer.promise;
        }

        HomeFactory.getFbFriend = function () {
            var defer = $q.defer();
            if (curUser) {
                HomeFactory.getData('overview').then(function (result) {

                    var token = result.token;
                    var endpoint = "https://graph.facebook.com/me/friends?access_token=";
                    var dataResult = [];
                    endpoint += token;
                    $http.get(endpoint)
                            .then(function (result) {
                                if (result !== null) {
                                    var fbFriend = result.data.data;
                                    var allFbUser = {};
                                    // console.log('friend', fbFriend);
                                    database.ref('/facebooks').once('value').then(function (snapshot) {
                                        allFbUser = snapshot.val();
                                        if (allFbUser !== null) {
                                            var ids = Object.keys(allFbUser);
                                            angular.forEach(ids, function (id, index) {
                                                angular.forEach(fbFriend, function (friend, index2) {
                                                    if (allFbUser[id].localeCompare(friend.id) === 0)
                                                        dataResult.push(id);
                                                    if (index === ids.length - 1 && index2 === fbFriend.length - 1)
                                                        defer.resolve(dataResult);
                                                })
                                            })
                                        } else
                                            defer.reject(null);
                                    })
                                } else
                                    defer.reject(null);

                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                })
            } else
                defer.reject(null);
            return defer.promise;
        }

        HomeFactory.getListUserFromUid = function (listUser) {
            var promises = [];
            angular.forEach(listUser, function (userId) {
                var promise = HomeFactory.getDataById(userId, 'overview');
                promises.push(promise);
            })
            return $q.all(promises).then(function (data) {
                return data;
            })
        }





//        HomeFactory.getFriend=function (){
//            console.log(curUser.uid);
//            var defer = $q.defer();
//              database.ref('friends/' + curUser.uid).on('child_changed', function (data){
//                  console.log(data);
//              });
//            return defer.promise;
//        }


        HomeFactory.checkFriend = function (friId) {
            //0 not friend
            //1 wait
            //2 rep
            //3 friend 
            var defer = $q.defer();
            var myFriends = {};
            var state = 0;

            if (curUser)
            {
                database.ref('friends/' + curUser.uid).once('value').then(function (snapshot) {
                    myFriends = snapshot.val();
                    if (!angular.isUndefined(myFriends) && myFriends !== null) {
                        var ids = Object.keys(myFriends);
                        angular.forEach(ids, function (id) {
                            if (id.localeCompare(friId) === 0) {
                                state = myFriends[id];
                            }
                        })
                    }
                    defer.resolve(state);
                });
            }
            return defer.promise;
        }

        //null remove, decline request
        //3 become friend
        //1 send request
        HomeFactory.friendHandle = function (id, friId) {
            var defer = $q.defer();
            if (curUser)
            {
                var updates = {};
                updates['/friends/' + curUser.uid + '/' + friId] = id;
                updates['friends/' + friId + '/' + curUser.uid] = id;
                if (id !== null && id === 1)
                    updates['friends/' + friId + '/' + curUser.uid] = 2;
                database.ref().update(updates);
            } else
                defer.reject();
            return defer.promise;
        }


        HomeFactory.searchUser = function (searchString) {

            searchString = latinize(searchString).toLowerCase();
            var query = database.ref('/users')
                    .orderByChild('overview/_search_index/full_name').startAt(searchString)
                    .once('value');
            var reversedQuery = database.ref('/users')
                    .orderByChild('overview/_search_index/reversed_full_name').startAt(searchString)
                    .once('value');
            return $q.all([query, reversedQuery])
                    .then(function (results) {
                        var user = {};
                        angular.forEach(results, function (data) {

                            angular.forEach(data.val(), function (key, value) {

                                user[value] = key;
                            })

                        });
                        var userIds = Object.keys(user);
                        angular.forEach(userIds, function (id) {

                            var name = user[id].overview._search_index.full_name;
                            var reversedName = user[id].overview._search_index.reversed_full_name;
                            if (!name.startsWith(searchString) && !reversedName.startsWith(searchString)) {
                                delete user[id];
                            }
                        })

                        return user;
                    }
                    );
        }
        HomeFactory.getDataById = function (id, key) {
            var defer = $q.defer();
            database.ref('users/' + id + '/' + key).once('value').then(function (snapshot) {
                defer.resolve(snapshot.val());
            });
            return defer.promise;
        }

        HomeFactory.getDatabase = function () {
            return database;
        }

        HomeFactory.getData = function (key) {

            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                {
                    curUser = user;
                    database.ref('users/' + user.uid + '/' + key).once('value').then(function (snapshot) {
                        defer.resolve(snapshot.val());
                    });
                }
            });
            return defer.promise;
        };
//        HomeFactory.getSummary = function () {
//            console.log('start get data');
//            var defer = $q.defer();
//            var unsubscribe = auth.onAuthStateChanged(function (user) {
//                unsubscribe();
//                if (user)
//                {
//                    database.ref('users/' + user.uid + '/' + 'summary').on('child_added', function (snapshot, prevChildKey) {
//                        console.log(prevChildKey);
//                        $rootScope.$broadcast('eventFired', snapshot.val());
//                    });
//
//
//                }
//            });
//            console.log('get datat end');
//            return defer.promise;
//        };

        HomeFactory.updateOverview = function (data, key) {
            var defer = $q.defer();
            if (curUser)
            {

                database.ref('users/' + curUser.uid + '/' + key).set(data);
                defer.resolve();
            } else
                defer.reject();
            return defer.promise;
        };
        HomeFactory.addData = function (data, key) {
            var defer = $q.defer();
            if (curUser)
            {
                var path = 'users/' + curUser.uid + '/' + key;
                var newkey = database.ref(path).push().key;
                database.ref(path + '/' + newkey).set(data);
                defer.resolve(newkey);
            } else
                defer.reject();
            return defer.promise;
        };
        HomeFactory.deleteData = function (key) {
            var defer = $q.defer();
            if (curUser)
            {
                database.ref('users/' + curUser.uid + '/' + key).remove();
                defer.resolve();
            } else
                defer.reject();
            return defer.promise;
        }
//HomeFactory.getSummary();
        HomeFactory.uploadImage = function (file, key) {
            var defer = $q.defer();
            console.log(file.name);
            console.log(Date.now());
            var picRef = storage.ref(curUser.uid + '/' + key + '/' + Date.now() + '/' + file.name);
            var metadata = {
                contentType: file.type}
            var picUploadTask = picRef.put(file, metadata);
            picUploadTask.on('state_changed',
                    function (snapshot) {
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                    }, function (error) {
                defer.reject();
            }, function () {

                var downloadURL = picUploadTask.snapshot.downloadURL;
                defer.resolve(downloadURL);
                console.log(downloadURL);
            });
            return defer.promise;
        };
        return HomeFactory;
    }]);

