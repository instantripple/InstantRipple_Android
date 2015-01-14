(function() {
    var irApp = angular.module('irApp');

    irApp.controller('indexController', [
        '$scope', 'clientSession', 'analytics',
        function ($scope, clientSession, analytics) {
            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'login') {
                    clientSession.clear();
                    $scope.showHeader = false;
                } else {
                    $scope.showHeader = true;
                }
                analytics.screenView(toState.name);
            });
        }
    ]);
})();