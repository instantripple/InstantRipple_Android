(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', 'analytics', '$state', 'clientSession', '$ionicLoading', '$timeout', '$ionicHistory', '$rootScope',
        function ($scope, analytics, $state, clientSession, $ionicLoading, $timeout, $ionicHistory, $rootScope) {
            $scope.loginForm = {};

            if (window.bypass) {
                $scope.loginForm.bypass = true;
            }

            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();

            var vaultClient = null;
            $scope.twoFactorInfo = null;
            var print = function(o) {
                var str = '';

                for (var p in o) {
                    if (typeof o[p] == 'string') {
                        str += p + ': ' + o[p] + '; </br>';
                    } else {
                        str += p + ': { </br>' + print(o[p]) + '}';
                    }
                }

                return str;
            };
            $scope.login = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                vaultClient = new rippleVaultClient.VaultClient();
                var deviceId = window.localStorage['ir.2faDeviceId'];
                if (!deviceId) {
                    deviceId = vaultClient.generateDeviceID();
                    window.localStorage['ir.2faDeviceId'] = deviceId;
                }
                vaultClient.loginAndUnlock($scope.loginForm.username || window.bypass_username, $scope.loginForm.password || window.bypass_password, deviceId, function (err, res) {
                    if (err) {
                        if (err.twofactor) {
                            $timeout(function() {
                                $scope.twoFactorInfo = err.twofactor;
                                $scope.loginForm.rememberMe = true;
                                $scope.loginForm.isError = false;
                                $ionicLoading.hide();
                            });
                        } else {
                            alert(print(err));
                            $timeout(function () {
                                delete $scope.loginForm.password;
                                $scope.loginForm.isError = true;
                                $ionicLoading.hide();
                            });
                        }
                    } else {
                        delete $scope.loginForm.password;
                        clientSession.start(res.username, res.blob.data.account_id, res.secret, res.blob);
                        $state.go('balances');
                    }
                });
            };
            $scope.twoFactorLogin = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                if (!$scope.loginForm.rememberMe) {
                    // The vault client does not seem to respect our decision to not remember our device.
                    window.localStorage['ir.2faDeviceId'] = null;
                }
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
                                $timeout(function () {
                                    delete $scope.loginForm.password;
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