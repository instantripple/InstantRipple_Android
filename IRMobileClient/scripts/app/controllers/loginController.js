(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', '$rootScope', '$state', 'clientSession',
        function ($scope, $rootScope, $state, clientSession) {
            $rootScope.showHeader = false;

            $scope.loginForm = {};

            $scope.login = function() {
                var vaultClient = new ripple.VaultClient();
                vaultClient.loginAndUnlock($scope.loginForm.username, $scope.loginForm.password, null, function(err, res) {
                    if (err) {
                        throw err;
                    }

                    clientSession.start(res.username, res.blob.data.account_id, res.secret, res.blob);
                    $state.go('home');
                });
            };
        }
    ]);
})();