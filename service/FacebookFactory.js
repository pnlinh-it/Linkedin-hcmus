angular.module('myApp').factory('FacebookFactory', function (CONFIG, $q) {

    var FBFactory = {};
    FBFactory.token = "";
    firebase.initializeApp(CONFIG, 'aawawdawd');
    var auth = firebase.auth();
    var database = firebase.database();
    
    return FBFactory;
});

