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
                        throw err;
                    }

                    clientSession.start(res.username, res.blob.data.account_id, res.secret);
                    $state.go('home');
                });
            };

            // Used to bypass login for testing. Secret will not be valid.
            $scope.bypass = function() {
                clientSession.start('SeanBennett', 'rBM2aVcC3ecy6swYsZFxTShsWRAvC7rCJa', '');
                $state.go('home');
            };
        }
    ]);
})();