(function() {
    var irApp = angular.module('irApp');

    irApp.controller('transactionsController', [
        '$scope', 'rippleRemote', 'clientSession', '$ionicLoading', '$timeout',
        function ($scope, rippleRemote, clientSession, $ionicLoading, $timeout) {
            var firstLoad = true;

            $scope.transactions = {};
            $scope.transactions.update = _.throttle(function() {
                if (firstLoad) {
                    $ionicLoading.show();
                }
                rippleRemote.getAccountTransactions(clientSession.session().address, function(err, res) {
                    var transactions = res.transactions;
                    transactions.forEach(function(transaction) {
                        if (transaction.destination == clientSession.session().address) {
                            transaction.receive = true;
                        }
                    });
                    $timeout(function () {
                        $scope.transactions.payments = transactions;
                    });
                    if (firstLoad) {
                        firstLoad = false;
                        $ionicLoading.hide();
                    }
                });
            }, 2000);
            $scope.transactions.update();

            $scope.$on('remote-updated', function () {
                $scope.transactions.update();
            });
            $scope.$on('remote-invalidated', function () {
                $scope.transactions.update();
            });
        }
    ]);
})();