(function() {
    var irApp = angular.module('irApp');

    irApp.controller('settingsController', [
        '$scope', '$state', 'clientSession',
        function ($scope, $state, clientSession) {
            $scope.logout = function () {
                if (clientSession.session().exists) {
                    clientSession.clear();
                    $rootScope.showHeader = false;
                    $state.go('login');
                }
            };
        }
    ]);
})();