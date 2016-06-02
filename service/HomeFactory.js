angular.module('myApp').factory('HomeFactory', ['CONFIG', '$q', function (CONFIG, $q) {

        var HomeFactory = {};
        firebase.initializeApp(CONFIG, "home");
        var auth = firebase.auth();
        var database = firebase.database();
        var storage = firebase.storage();

        var curUser = {};
        auth.onAuthStateChanged(function (user) {
            curUser = user;
        });



        HomeFactory.getData = function () {
            var defer = $q.defer();
            var mtdata = {};
            var unsubscribe = auth.onAuthStateChanged(function (user) {
                unsubscribe();
                if (user)
                {
                    curUser = user;
                    console.log('getdata');
                    database.ref('users/' + user.uid + '/overview').once('value').then(function (snapshot) {
                        mtdata.overview = snapshot.val();
                        defer.resolve(mtdata);
                    });
                }
            });
            return defer.promise;
        };

        HomeFactory.updateOverview = function (overview) {
            var defer = $q.defer();
            if (curUser)
            {
                database.ref('users/' + curUser.uid + '/overview').set(overview);
                defer.resolve();

            } else
                defer.reject();
            return defer.promise;
        };

        HomeFactory.uploadImage = function (file) {
            var defer = $q.defer();
            console.log(file.name);
            console.log(Date.now());
            var picRef = storage.ref(curUser.uid + '/overview/' + Date.now() + '/' + file.name);
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

