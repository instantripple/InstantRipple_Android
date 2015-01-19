
(function() {
    var irApp = angular.module('irApp');

    irApp.controller('unfundedController', [
        '$scope', 'clientSession', '$ionicLoading', '$timeout', 'rippleRemote', '$state',
        function ($scope, clientSession, $ionicLoading, $timeout, rippleRemote, $state) {
            $ionicLoading.hide();
            $scope.username = clientSession.session().username;
            $scope.qrcode = "https://ripple.com//send?to=" + clientSession.session().address;
            $scope.reserve = rippleRemote.getReserve();

            $scope.$on('transaction-received', function(event, transaction) {
                $state.go('balances');
            });
        }
    ]);
})();