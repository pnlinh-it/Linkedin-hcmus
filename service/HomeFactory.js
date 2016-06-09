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
        HomeFactory.getDatabase = function () {
            return database;
        }


        HomeFactory.addNewPost = function (post) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    HomeFactory.getDataById(curUser.uid, 'overview').then(function (user) {
                        var newPostKey = database.ref('/posts').push().key;
                        var update = {};
                        var newPost = {
                            img: post.img,
                            caption: post.caption,
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            author: {
                                uid: user.uid,
                                name: user.name,
                                img: user.img,
                                letter: getName(user.name).trim(),
                                isImg: checkImgOK(user.img)
                            }
                        };
                        update['/posts/' + newPostKey] = newPost;
                        update['users/' + curUser.uid + '/posts/' + newPostKey] = true;
                        database.ref().update(update).then(function () {
                            newPost.pid=newPostKey;
                            newPost.comments={};
                            defer.resolve(newPost);
                        })

                    })

                }
            });
            return defer.promise;
        }

        HomeFactory.addComment = function (postId, conmentText) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    HomeFactory.getDataById(curUser.uid, 'overview').then(function (user) {
                        var commentObject = {
                            text: conmentText,
                            timestamp: Date.now(),
                            author: {
                                uid: user.uid,
                                name: user.name,
                                img: user.img,
                                letter: getName(user.name).trim(),
                                isImg: checkImgOK(user.img)
                            }
                        };

                        database.ref('comments/' + postId).push(commentObject).then(function () {
                            console.log('add comment completed')
                            defer.resolve();
                        })
                    })

                }
            });
            return defer.promise;
        }

        HomeFactory.getCurrentUserPost = function () {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    HomeFactory.getUserPost(curUser.uid).then(function (data) {
                        defer.resolve(data);
                    });
                }
            });
            return defer.promise;
        }
        HomeFactory.deletePost = function (pid) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    var updateObj = {};
                    updateObj['users/' + curUser.uid + '/posts/' + pid] = null;
                    updateObj['comments/' + pid] = null;
                    updateObj['posts/' + pid] = null;
                    database.ref().update(updateObj).then(function () {
                        defer.resolve();
                    })
                }
            });
            return defer.promise;
        }

        HomeFactory.getUserPost = function (userId) {
            var defer = $q.defer();
            database.ref('users/' + userId + '/posts').once('value').then(function (snapshot) {
                var result = {};
                if (snapshot.val() === null)
                    result = {};
                else
                    result = snapshot.val();

                var ids = Object.keys(result);
                var promises = [];
                angular.forEach(ids, function (id) {
                    var promise = HomeFactory.getPostData(id);
                    promises.push(promise);
                })
                $q.all(promises).then(function (data) {
                    angular.forEach(data, function (post) {
                        result[post.key] = post.val();
                    })

                    promises = [];
                    angular.forEach(ids, function (id) {
                        var promise = HomeFactory.getPostComment(id);
                        promises.push(promise);
                    })
                    $q.all(promises).then(function (cmtPro) {
                        angular.forEach(cmtPro, function (comment) {
                            result[comment.key]['comments'] = comment.val();
                        })

                        defer.resolve(result);
                    })




                })
            })
            return defer.promise;
        }
        HomeFactory.getPostData = function (postId) {
            return database.ref('/posts/' + postId).once('value');
        }
        HomeFactory.getPostComment = function (postId) {
            return database.ref('/comments/' + postId).once('value');
        }












        HomeFactory.getListFriend = function (state) {
            var defer = $q.defer();
            var listFriend = {};
            var dataReturn = [];
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    database.ref('friends/' + curUser.uid).once('value').then(function (snapshot) {
                        if (snapshot.val() !== null) {
                            listFriend = snapshot.val();
                            var ids = Object.keys(listFriend);
                            angular.forEach(ids, function (key, index) {
                                if (listFriend[key] === state)
                                    dataReturn.push(key);
                                if (index === ids.length - 1)
                                    defer.resolve(dataReturn);
                            })
                        } else
                            defer.resolve(null);
                    })
                }
            });
            return defer.promise;
        }

        HomeFactory.getListFriendFromId = function (id) {
            var defer = $q.defer();
            var listFriend = {};
            var dataReturn = [];
            database.ref('friends/' + id).once('value').then(function (snapshot) {
                if (snapshot.val() !== null) {
                    listFriend = snapshot.val();
                    var ids = Object.keys(listFriend);
                    angular.forEach(ids, function (key, index) {
                        if (listFriend[key] === 3)
                            dataReturn.push(key);
                        if (index === ids.length - 1)
                            defer.resolve(dataReturn);
                    })
                } else
                    defer.resolve(null);
            })
            return defer.promise;
        }

        HomeFactory.getListMessage = function () {
            var defer = $q.defer();
            var returnData = [];
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    HomeFactory.getListFriendFromId(curUser.uid).then(function (result) {
                        if (result != null) {
                            HomeFactory.getListUserFromUid(result).then(function (listFri) {

                                if (listFri !== null) {
                                    var promises = [];
                                    angular.forEach(listFri, function (friend) {
                                        var promise = HomeFactory.getLastMessage(curUser.uid, friend.uid);
                                        promises.push(promise);
                                    })
                                    return $q.all(promises).then(function (data) {

                                        if (data != null) {
                                            angular.forEach(data, function (message, index) {
                                                if (message != null) {
                                                    angular.forEach(listFri, function (friend) {
                                                        if (message.uid === friend.uid) {
                                                            friend.message = message[Object.keys(message)[0]].message;
                                                            friend.letter = getName(friend.name).trim();
                                                            friend.isImg = checkImgOK(friend.img);
                                                            friend.time = message[Object.keys(message)[0]].time;
                                                            returnData.push(friend);
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        defer.resolve(returnData);
                                    })
                                } else
                                    defer.resolve(returnData);
                            })
                        } else
                            defer.resolve(returnData);
                    });
                }
            });
            return defer.promise;
        }

        HomeFactory.getLastMessage = function (userID, friendID) {
            var defer = $q.defer();
            database.ref('users/' + userID + '/messages/' + friendID).limitToLast(1).once('value').then(function (snapshot) {
                var rs = null;
                if (snapshot.val() != null) {
                    rs = snapshot.val();
                    rs.uid = friendID;
                }
                defer.resolve(rs);
            });
            return defer.promise;
        }

        HomeFactory.sendMessage = function (message, id) {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    var data = {};
                    data.message = message;
                    data.time = Date.now();
                    data.isFromMe = true;
                    var path = 'users/' + curUser.uid + '/messages/' + id;
                    var path2 = 'users/' + id + '/messages/' + curUser.uid;
                    var newkey = database.ref(path).push().key;
                    var newkey2 = database.ref(path2).push().key;
                    database.ref(path + '/' + newkey).set(data);
                    data.isFromMe = false;
                    data.uid =
                            database.ref(path2 + '/' + newkey2).set(data);
                    defer.resolve();
                }
            });
            return defer.promise;
        }

        HomeFactory.getCurentUser = function () {
            var defer = $q.defer();
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser)
                {
                    HomeFactory.getDataById(curUser.uid, 'overview').then(function (data) {
                        defer.resolve(data);
                    })
                }
            });
            return defer.promise;
        }

        HomeFactory.getUser = function () {
            var defer = $q.defer();
            auth.onAuthStateChanged(function (user) {
                curUser = user;
                HomeFactory.uid = user.uid;
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

        HomeFactory.checkFriend = function (friId) {
//0 not friend
//1 wait
//2 rep
//3 friend 
            var defer = $q.defer();
            var myFriends = {};
            var state = 0;
            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
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

            });
            return defer.promise;
        }

//null remove, decline request
//3 become friend
//1 send request
        HomeFactory.friendHandle = function (id, friId) {

            var unsubscribe = auth.onAuthStateChanged(function (curUser) {
                unsubscribe();
                if (curUser) {
                    var updates = {};
                    updates['/friends/' + curUser.uid + '/' + friId] = id;
                    updates['friends/' + friId + '/' + curUser.uid] = id;
                    if (id !== null && id === 1)
                        updates['friends/' + friId + '/' + curUser.uid] = 2;
                    database.ref().update(updates).then(function () {
                        defer.resolve();
                    })
                } else
                    defer.reject();
                return defer.promise;
            });
            var defer = $q.defer();
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

