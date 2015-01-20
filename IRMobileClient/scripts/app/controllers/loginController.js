(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', 'analytics', '$state', 'clientSession', '$ionicLoading', '$timeout',
        function ($scope, analytics, $state, clientSession, $ionicLoading, $timeout) {
            $scope.loginForm = {};

            if (window.bypass) {
                $scope.loginForm.bypass = true;
            }

            var vaultClient = null;
            $scope.twoFactorInfo = null;

            $scope.login = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                vaultClient = new ripple.VaultClient($scope.loginForm.username);
                var deviceId = window.localStorage['ir.2faDeviceId'];
                if (!deviceId) {
                    deviceId = vaultClient.generateDeviceID();
                    window.localStorage['ir.2faDeviceId'] = deviceId;
                }
                vaultClient.loginAndUnlock($scope.loginForm.username || window.bypass_username, $scope.loginForm.password || window.bypass_password, deviceId, function (err, res) {
                    delete $scope.loginForm.password;
                    if (err) {
                        if (err.twofactor) {
                            $timeout(function() {
                                $scope.twoFactorInfo = err.twofactor;
                                $scope.loginForm.rememberMe = true;
                                $scope.loginForm.isError = false;
                                $ionicLoading.hide();
                            });
                        } else {
                            $timeout(function() {
                                $scope.loginForm.isError = true;
                                $ionicLoading.hide();
                            });
                        }
                    } else {
                        clientSession.start(res.username, res.blob.data.account_id, res.secret, res.blob);
                        $state.go('balances');
                    }
                });
            };
            $scope.twoFactorLogin = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                vaultClient.verifyToken({
                    url: $scope.twoFactorInfo.blob_url,
                    id: $scope.twoFactorInfo.blob_id,
                    device_id: $scope.twoFactorInfo.device_id,
                    token: $scope.loginForm.token,
                    remember_me: $scope.loginForm.rememberMe
            }, function(err, res) {
                    if (err) {
                        $timeout(function() {
                            $scope.loginForm.isError = true;
                            $ionicLoading.hide();
                        });
                    } else {
                        vaultClient.loginAndUnlock($scope.loginForm.username || window.bypass_username, $scope.loginForm.password || window.bypass_password, $scope.twoFactorInfo.device_id, function(err2, res2) {
                            delete $scope.loginForm.password;
                            if (err2) {
                                $timeout(function() {
                                    $scope.twoFactorInfo = null;
                                    $scope.loginForm.rememberMe = true;
                                    $scope.loginForm.isError = true;
                                    $ionicLoading.hide();
                                });
                            } else {
                                clientSession.start(res2.username, res2.blob.data.account_id, res2.secret, res2.blob);
                                $state.go('balances');
                            }
                        });
                    }
                });
            }
        }
    ]);
})();