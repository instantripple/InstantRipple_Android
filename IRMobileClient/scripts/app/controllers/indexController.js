(function() {
    var irApp = angular.module('irApp');

    irApp.controller('indexController', [
        '$scope', 'clientSession', 'analytics', '$ionicHistory', '$ionicLoading', '$ionicModal',
        function ($scope, clientSession, analytics, $ionicHistory, $ionicLoading, $ionicModal) {
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
                    $scope.userUsername = clientSession.session().username;
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
                });
            });
        }
    ]);
})();