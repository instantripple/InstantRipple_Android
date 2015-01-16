(function() {
    var irApp = angular.module('irApp');

    irApp.controller('transactionsController', [
        '$scope', 'rippleRemote', 'clientSession', '$timeout',
        function ($scope, rippleRemote, clientSession, $timeout) {
            $scope.transactions = {};
            $scope.transactions.update = function () {
                rippleRemote.getAccountTransactions(clientSession.session().address, function (err, res) {
                    var transactions = res.transactions;
                    $scope.$apply(function () {
                        transactions.forEach(function (transaction) {
                            if (transaction.sender == clientSession.session().address) {
                                transaction.receive = true;
                            }
                        });
                        $scope.transactions.payments = transactions;
                    });
                });
            };
            $scope.transactions.update();
        }
    ]);
})();