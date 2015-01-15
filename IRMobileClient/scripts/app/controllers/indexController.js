(function() {
    var irApp = angular.module('irApp');

    irApp.controller('indexController', [
        '$scope', 'clientSession', 'analytics', '$ionicHistory',
        function ($scope, clientSession, analytics, $ionicHistory) {
            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'login') {
                    $ionicHistory.clearHistory();
                    clientSession.clear();
                    $scope.showHeader = false;
                } else {
                    $scope.showHeader = true;
                }

                if (fromState.name === 'login') {
                    $ionicHistory.clearHistory();
                }

                analytics.screenView(toState.name);
            });
        }
    ]);
})();