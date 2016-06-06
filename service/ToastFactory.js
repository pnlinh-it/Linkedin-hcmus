angular.module('myApp').factory('ToastFactory', ['$mdToast', '$window','$location', function ($mdToast, $window,$location) {
        var ToastFactory = {};
        ToastFactory.show = function (content) {
            $mdToast.show(
                    $mdToast.simple()
                    .content(content)
                    .position('top right')
                    .hideDelay(3000)
                    );
        };

        ToastFactory.showCustom = function (content, id) {
            var toast = $mdToast.simple()
                    .textContent(content)
                    .action('See More')
                    .highlightAction(true)
                    .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                    .position('top right')
                    .hideDelay(4000);
            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    var s = '/user/' + id.trim();
                   $location.url(s);
                }

            });
        }
        return ToastFactory;
    }]);


