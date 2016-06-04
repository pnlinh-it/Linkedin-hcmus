angular.module('myApp').factory('ToastFactory', ['$mdToast', function ($mdToast) {
        var ToastFactory = {};
        ToastFactory.show = function (content) {
            var parent = document.getElementById("main");
            
            $mdToast.show(
                    $mdToast.simple()
                    .content(content)
                    .position('top right')
                    .hideDelay(3000)
                   
                    );
        };
        return ToastFactory;
    }]);


