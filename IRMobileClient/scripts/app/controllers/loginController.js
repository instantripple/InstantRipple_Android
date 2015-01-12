(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', '$rootScope', '$state', 'clientSession', '$ionicLoading',
        function ($scope, $rootScope, $state, clientSession, $ionicLoading) {
            $rootScope.showHeader = false;

            $scope.loginForm = {};

            $scope.login = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                var vaultClient = new ripple.VaultClient();
                vaultClient.loginAndUnlock($scope.loginForm.username, $scope.loginForm.password, null, function (err, res) {
                    delete $scope.loginForm.password;
                    if (err) {
                        $scope.loginForm.isError = true;
                        $ionicLoading.hide();
                        return;
                    }

                    clientSession.start(res.username, res.blob.data.account_id, res.secret, res.blob);
                    $ionicLoading.hide();
                    $state.go('home');
                });
            };
        }
    ]);
})();