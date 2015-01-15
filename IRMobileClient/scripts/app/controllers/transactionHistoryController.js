(function() {
    var irApp = angular.module('irApp');

    irApp.controller('transactionHistoryController', [
        '$scope', 'rippleRemote', 'clientSession', '$timeout',
        function ($scope, rippleRemote, clientSession, $timeout) {
            $scope.transactions = {};
            $scope.transactions.update = function () {
                rippleRemote.getAccountTransactions(clientSession.session().address, function (err, res) {
                    var transactions = res.transactions;
                    $scope.$apply(function () {
                        $scope.transactions.payments = transactions;
                    });
                });
                $timeout($scope.transactions.update, 60000);
            };

            $scope.transactions.update();
        }
    ]);
})();