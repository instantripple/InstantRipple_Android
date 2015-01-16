(function() {
    var irApp = angular.module('irApp');

    irApp.controller('transactionsController', [
        '$scope', 'rippleRemote', 'clientSession', '$ionicLoading',
        function ($scope, rippleRemote, clientSession, $ionicLoading) {
            $scope.transactions = {};
            $scope.transactions.update = function () {
                $ionicLoading.show();
                rippleRemote.getAccountTransactions(clientSession.session().address, function (err, res) {
                    var transactions = res.transactions;
                    $scope.$apply(function () {
                        transactions.forEach(function (transaction) {
                            if (transaction.destination == clientSession.session().address) {
                                transaction.receive = true;
                            }
                        });
                        $scope.transactions.payments = transactions;
                        $ionicLoading.hide();
                    });
                });
            };
            $scope.transactions.update();
        }
    ]);
})();