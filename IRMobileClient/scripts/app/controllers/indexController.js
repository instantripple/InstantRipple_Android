(function() {
    var irApp = angular.module('irApp');

    irApp.controller('indexController', [
        '$scope', 'clientSession', 'analytics', '$ionicHistory', '$ionicLoading',
        function ($scope, clientSession, analytics, $ionicHistory, $ionicLoading) {
            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'login') {
                    if (clientSession.session().exists) {
                        $ionicLoading.show();
                        location.reload();
                    }
                    clientSession.clear();
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
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