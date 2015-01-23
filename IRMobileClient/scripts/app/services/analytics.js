(function () {
    var irApp = angular.module('irApp');

    irApp.factory('analytics', ['$ionicPlatform', function ($ionicPlatform) {
        var isEmulated = typeof (window.tinyHippos) === "object";


        $ionicPlatform.ready(function () {
            if (!isEmulated) {
                window.analytics.startTrackerWithId('UA-58514925-4');
            }
        });

        var screenView = function (screenName) {
            if (isEmulated) {
                return;
            }
            window.analytics.trackView(screenName);
        };

        return {
            screenView: screenView
        };
    }]);
})();