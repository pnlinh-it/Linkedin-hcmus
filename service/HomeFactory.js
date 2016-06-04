angular.module('myApp').factory('HomeFactory', ['CONFIG', '$q', '$rootScope', function (CONFIG, $q, $rootScope) {


        var HomeFactory = {};
        HomeFactory.data = {};
        HomeFactory.data.summary = [{}];
        HomeFactory.data.experience = {};
        HomeFactory.data.project = {};


        firebase.initializeApp(CONFIG, "home");
        var auth = firebase.auth();
        var database = firebase.database();
        var storage = firebase.storage();

        var curUser = {};
        auth.onAuthStateChanged(function (user) {
            curUser = user;
        });

        HomeFactory.getData = function (key) {
            console.log('start get data');
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

