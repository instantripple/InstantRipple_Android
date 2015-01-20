(function() {
    var irApp = angular.module('irApp');

    irApp.controller('indexController', [
        '$scope', 'clientSession', 'analytics', '$ionicHistory', '$ionicLoading', '$ionicModal', 'rippleRemote', '$rootScope', '$ionicPlatform',
        function ($scope, clientSession, analytics, $ionicHistory, $ionicLoading, $ionicModal, rippleRemote, $rootScope, $ionicPlatform) {
            $rootScope.hasInit = false;

            $ionicPlatform.ready(function () {
                $rootScope.appVersion = window.appVersion;
                rippleRemote.init();
                $rootScope.hasInit = true;
            });

            $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'login') {
                    if (clientSession.session().exists) {
                        clientSession.clear();
                    }
                    $scope.showHeader = false;
                } else if (toState.name === 'unfunded') {
                    $scope.showHeader = false;
                } else {
                    $scope.showHeader = true;
                }

                if (fromState.name === 'login') {
                    $scope.userUsername = clientSession.session().username;
                    $rootScope.$broadcast('remote-invalidated');
                }

                analytics.screenView(toState.name);
            });

            $scope.$on('transaction-received', function(event, transaction) {
                var modalScope = $scope.$new();
                modalScope.transaction = transaction;
                $ionicModal.fromTemplateUrl('views/modal-received.html', {
                    scope: modalScope
                }).then(function (modal) {
                    modal.show();
                    modalScope.close = function() {
                        modal.hide();
                        modal.remove();
                    }
                });
            });
        }
    ]);
})();