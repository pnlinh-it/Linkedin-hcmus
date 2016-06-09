var myApp = angular.module('myApp');
myApp.controller('homeCtl', function ($q, $scope, $mdDialog, HomeFactory, ToastFactory, $timeout, FacebookFactory, $location) {

    var self = this;

    self.isCanAddFriend = false;
    self.canSendMessage = false;
    self.canKnow = [];
    self.isAuther = true;
    self.data = HomeFactory.data;
    self.showAvatar = true;
    self.name = 's';
    self.showLine = "";
    self.colsize = '8';
    self.listUn = {
        'summary': false,
        'experience': false,
        'project': false,
        'skill': false,
        'education': false,
        'volunteer': false
    };
    self.listFriend = [];

    self.getTime = function (time) {
        return getTimeText(time);
    }
    self.posts = [];
    self.cmt = {};
    HomeFactory.getData('overview').then(function (result)
    {

        self.data.overview = result;
        if (!checkOK(self.data.overview.img) || self.data.overview.img.trim().length < 1)
            self.showAvatar = false;
        if (!self.checkUn(self.data.overview.place) && !self.checkUn(self.data.overview.phone))
            self.showLine = "|";
        self.name = getName(self.data.overview.name).trim();

        HomeFactory.getFbFriend().then(function (result) {
            HomeFactory.getListUserFromUid(result).then(function (data) {
                if (data !== null) {
                    angular.forEach(data, function (user) {
                        user.letter = getName(user.name).trim();
                        user.isImg = checkImgOK(user.img);
                        self.canKnow.push(user);
                    })

                }
            });
        })
    });

    self.showPost = function () {
        console.log('show post');
    }
    self.gotoFriend = function (id) {
        var s = '/user/' + id.trim();
        $location.url(s);
    }

    HomeFactory.getData('summary').then(function (result) {

        if (checkOK(result)) {
            self.data.summary = result;
            self.listUn.summary = true;
        }
    });
    HomeFactory.getData('experience').then(function (result) {

        if (checkOK(result)) {
            self.data.experience = result;
            self.listUn.experience = true;
        }
    });
    HomeFactory.getData('project').then(function (result) {

        if (checkOK(result)) {
            self.data.project = result;
            self.listUn.project = true;
        }
    });
    HomeFactory.getData('skill').then(function (result) {
        if (checkOK(result)) {
            self.data.skill = result;
            self.listUn.skill = true;
        }
    });
    HomeFactory.getData('education').then(function (result) {
        if (checkOK(result)) {
            self.data.education = result;
            self.listUn.education = true;
        }
    });
    HomeFactory.getData('volunteer').then(function (result) {
        if (checkOK(result)) {
            self.data.volunteer = result;
            self.listUn.volunteer = true;
        }

    });


    HomeFactory.getListFriend(3).then(function (result) {
        if (result != null) {
            HomeFactory.getListUserFromUid(result).then(function (listFri) {
                angular.forEach(listFri, function (user) {
                    user.letter = getName(user.name).trim();
                    user.isImg = checkImgOK(user.img);
                    self.listFriend.push(user);
                })
            })
        }
    }).catch(function (data) {
        console.log(data);
    });


    self.checkUn = function (value) {
        return angular.isUndefined(value);
    }

    self.checkSummary = function () {
        return self.checkUn(self.data.summary)
    }
    //HomeFactory.addComment('-KJplXZHwXdBGktxLt6e', 'Test Comment 02');
    // HomeFactory.addComment('-KJqEvXZDyh84NfOxoX8', 'Test Comment 01');
    //  HomeFactory.addComment('-KJqEvXZDyh84NfOxoX8', 'Test Comment 02');


    HomeFactory.getCurrentUserPost().then(function (listPost) {

        if (listPost !== null) {

            var ids = Object.keys(listPost);
            angular.forEach(ids, function (id) {
                var post = listPost[id];
                post.pid = id;
                self.posts.push(post);
            })
            console.log(self.posts);
            console.log(listPost);
        }
    })
    self.addComment = function (postId, text, index) {
        console.log(text);
        if (!angular.isUndefined(text) && text.length > 0) {
            HomeFactory.addComment(postId, text);

        }

        self.cmt['id' + index] = "";
    }


    self.addNewPost = function (ev) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            controller: 'postCtl',
            templateUrl: 'template/add-post.html',
            parent: parentEl,
            targetEvent: ev,
        }).then(function (data) {
            HomeFactory.addNewPost(data).then(function (result) {
                self.posts.push(result);
                console.log(result);
            })
        }, function () {

        });
    }

    self.showEdit = function (ev, template, data, isAdd, isArray, key) {
        var templatePath = "template/" + template;
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: templatePath,
            parent: parentEl,
            locals: {
                data: data,
                isAdd: isAdd,
                isArray: isArray,
                key: key
            },
            targetEvent: ev,
        }).then(function (result) {
            var data = result.data;
            var key = result.key;
            var isAdd = result.isAdd;
            if (isAdd) {
                HomeFactory.addData(data, key).then(function (newKey) {
                    if (key.indexOf('/') > 0) {
                        var k = key.split('/');
                        if (k.length == 3)
                        {
                            if (self.checkUn(HomeFactory.data[k[0]][k[1]][k[2]]))
                                HomeFactory.data[k[0]][k[1]][k[2]] = {};
                            HomeFactory.data[k[0]][k[1]][k[2]][newKey] = data;
                        }

                    } else
                    {

                        HomeFactory.data[key][newKey] = data;
                    }
                    ToastFactory.show("Add Complete");
                });
            } else {
                console.log(key);
                if (key.localeCompare('overview') === 0) {
                    if (checkOK(self.data.overview.img) && self.data.overview.img.trim().length > 1)
                        self.showAvatar = true;
                    else
                        self.showAvatar = false;
                    if (checkOK(self.data.overview.name))
                        self.name = getName(self.data.overview.name).trim();
                    var searchFullName = data.name.toLowerCase();
                    var searchReversedFullName = searchFullName.split(' ').reverse().join(' ');
                    try {
                        searchFullName = latinize(searchFullName);
                        searchReversedFullName = latinize(searchReversedFullName);
                    } catch (e) {
                        console.error(e);
                    }
                    data._search_index = {
                        full_name: searchFullName,
                        reversed_full_name: searchReversedFullName
                    };

                }
                HomeFactory.updateOverview(data, key).then(function () {
                    ToastFactory.show("Save Complete");
                });
            }
            if (checkOK(data))
                self.listUn[key] = true;
            else
                self.listUn[key] = false;
            console.log(self.listUn)
        }, function () {

        });
    };
    self.deleteData = function (key) {
        HomeFactory.deleteData(key).then(function () {
            ToastFactory.show("Delete Complete");
            var k = getkey(key);
            if (k !== null)
            {
                delete HomeFactory.data[k.key01][k.key02];
                if (!checkOK(HomeFactory.data[k.key01]))
                    self.listUn[k.key01] = false;
            }

        });
    }
    self.deletePost = function (pid, index) {
        HomeFactory.deletePost(pid).then(function () {
            console.log('delete completed');
            console.log(index);
            var i = -1;
            var isloop = true;
            angular.forEach(self.posts, function (post, index) {
                if (isloop) {
                    if (post.pid === pid) {
                        i = index;
                        isloop = false;
                    }
                }
            })
            $timeout(function () {
                if (i >= 0) {
                    self.posts.splice(i, 1);
                }

            }, 1);
        });
    };

    self.database = HomeFactory.getDatabase();
    var newItems = false;
    self.database.ref('comments/').once('value', function (result) {
        newItems = true;
    });
    self.database.ref('comments/').on('child_changed', function (result) {
        if (newItems)
            self.addcmt(result);
    });

    self.database.ref('comments/').on('child_added', function (result) {
        if (newItems)
            self.addcmt(result);
    });

    self.addcmt = function (result) {
        var isloop = true;
        angular.forEach(self.posts, function (post, index) {
            if (isloop) {
                if (post.pid === result.key) {
                    self.database.ref('comments/' + result.key).limitToLast(1).once('value').then(function (cmt) {
                        var cm = cmt.val();
                        $timeout(function () {
                            self.posts[index].comments[Object.keys(cm)[0]] = cm[Object.keys(cm)[0]];
                        }, 1);
                    })
                }
            }

        })
    }




});
myApp.controller('postCtl', function ($timeout, $scope, $mdDialog, HomeFactory) {

    $scope.post = {};
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.addPost = function (data) {
        $mdDialog.hide(data);
    }


    $scope.setFile = function (element, data, isLoadAtt, key) {
        $timeout(function () {
            $scope[isLoadAtt] = true;
        }, 1);
        $scope.currentFile = element.files[0];
        var result = HomeFactory.uploadImage($scope.currentFile, key);
        result.then(function (url) {
            $scope[isLoadAtt] = false;
            $scope.post[data] = url;
        });
    };
    $scope.uploadClick = function (id) {
        var el = document.getElementById(id);
        el.click();
    };
})
myApp.controller('DialogController',
        function ($scope, $mdDialog, HomeFactory, $timeout,
                data, isAdd, isArray, key) {

            $scope.isAdd = isAdd;
            $scope.isArray = isArray;
            $scope.uploading = false;
            $scope.medUp = [];
            if (isAdd)

            {
                $scope.dialogData = {};
            } else
            {
                if (!checkOK(data))
                {
                    if (isArray)
                        data = [{}];
                    else
                        data = {};
                }
                $scope.dialogData = angular.copy(data);
            }


            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.check = function (test) {
                return angular.isUndefined(test);
            };
            $scope.delete = function () {
                $scope.onOK(null);
            }
            $scope.onOK = function (dataReturn) {
                var result = {};
                result.isAdd = isAdd;
                result.key = key;
                if (isAdd) {
                    result.data = angular.copy(dataReturn);
                } else {
                    //  overview
                    //  overview/-KJMFl4emRsXCrfBECyM

                    data = angular.copy(dataReturn);
                    var k = key.split('/');
                    if (k.length == 1)
                        HomeFactory.data[k[0]] = dataReturn;
                    if (k.length == 2)
                        HomeFactory.data[k[0]][k[1]] = dataReturn;
                    if (k.length == 4)
                        HomeFactory.data[k[0]][k[1]][k[2]][k[3]] = dataReturn;
                    result.data = data;
                }
                $mdDialog.hide(result);
            };
            $scope.setFile = function (element, data, isLoadAtt, key) {
                $timeout(function () {
                    $scope.uploading = true;
                    $scope[isLoadAtt] = true;
                }, 1);
                $scope.currentFile = element.files[0];
                var result = HomeFactory.uploadImage($scope.currentFile, key);
                result.then(function (url) {
                    $scope.uploading = false;
                    $scope[isLoadAtt] = false;
                    $scope.dialogData[data] = url;
                });
            };
            $scope.uploadClick = function (id) {
                var el = document.getElementById(id);
                el.click();
            };
            $scope.init = function (index) {
                var g = {isload: false, id: 'id' + index};
                $scope.medUp.push(g)

            }


        });
function  showDialog(ev, title, msg, $mdDialog) {
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

function checkOK(value) {

    var is = !angular.isUndefined(value) && value !== null;
    if (is)
    {
        if (angular.isArray(value))
        {
            if (value.length > 0)
                return true;
            else
                return false;
        } else {
            if (angular.equals({}, value))
                return false
        }


        return true;
    }
    return false;
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

function getkey(key) {
    var result = {};
    var i = key.indexOf('/');
    if (i > 0) {
        result.key01 = key.substring(0, i);
        result.key02 = key.substring(i + 1, key.length);
        return result;
    } else
        return null;
}

function getLength(obj) {
    return Object.keys(obj).length;
}

function  getTimeText(postCreationTimestamp) {
    var millis = Date.now() - postCreationTimestamp;
    var ms = millis % 1000;
    millis = (millis - ms) / 1000;
    var secs = millis % 60;
    millis = (millis - secs) / 60;
    var mins = millis % 60;
    millis = (millis - mins) / 60;
    var hrs = millis % 24;
    var days = (millis - hrs) / 24;
    var timeSinceCreation = [days, hrs, mins, secs, ms];

    var timeText = 'Now';
    if (timeSinceCreation[0] !== 0) {
        timeText = timeSinceCreation[0] + 'd';
    } else if (timeSinceCreation[1] !== 0) {
        timeText = timeSinceCreation[1] + 'h';
    } else if (timeSinceCreation[2] !== 0) {
        timeText = timeSinceCreation[2] + 'm';
    }
    return timeText;
}