(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', '$state', 'clientSession',
        function ($scope, $state, clientSession) {
            $scope.loginForm = {};

            $scope.login = function() {
                var vaultClient = new ripple.VaultClient();
                vaultClient.loginAndUnlock($scope.loginForm.username, $scope.loginForm.password, null, function(err, res) {
                    if (err) {
                        return;
                    }

                    clientSession.start(res.username, res.blob.data.account_id, res.secret);
                    $state.go('home');
                });
            }
        }
    ]);
})();