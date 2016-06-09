angular.module('myApp').factory('ToastFactory', ['$mdToast', '$window', '$location', function ($mdToast, $window, $location) {
        var ToastFactory = {};
        ToastFactory.show = function (content) {
            $mdToast.show(
                    $mdToast.simple()
                    .content(content)
                    .position('bottom left')
                    .hideDelay(5000)
                    );
        };

        ToastFactory.showCustom = function (content, id, path) {
            var toast = $mdToast.simple()
                    .textContent(content)
                    .action('See More')
                    .highlightAction(true)
                    .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                    .position('bottom left')
                    .hideDelay(5000);
            $mdToast.show(toast).then(function (response) {
                if (response === 'ok') {
                    var s = '';
                    if (angular.isUndefined(path))
                        s = '/user/' + id.trim();
                    else
                        s = '/' + path + '/' + id.trim();
                    $location.url(s);
                }

            });
        }
        return ToastFactory;
    }]);


