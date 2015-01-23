(function () {
    var irApp = angular.module('irApp');

    irApp.factory('analytics', ['$ionicPlatform', function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            window.analytics.startTrackerWithId('UA-58514925-4');
        });

        var screenView = function(screenName) {
            window.analytics.trackView(screenName);
        };

        return {
            screenView: screenView
        };
    }]);
})();