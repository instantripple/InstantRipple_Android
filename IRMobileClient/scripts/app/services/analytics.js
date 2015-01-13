(function () {
    var irApp = angular.module('irApp');

    irApp.factory('analytics', [function () {
        var googleAnalytics = ga;

        googleAnalytics('create', 'UA-58514925-3', 'auto');
        googleAnalytics('set', {
            'appName': 'Instant Ripple',
            'appId': 'IRMobileClient',
        });

        var screenView = function(screenName) {
            googleAnalytics('send', 'screenview', {
                'screenName': screenName
            });
        };

        return {
            screenView: screenView
        };
    }]);
})();