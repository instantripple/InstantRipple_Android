(function() {
    var irApp = angular.module('irApp');

    irApp.controller('homeController', [
        '$scope', '$rootScope', '$state', 'clientSession', 'rippleRemote',
        function ($scope, $rootScope, $state, clientSession, rippleRemote) {
            // BALANCES
            $scope.balances = {};
            $rootScope.balances = $scope.balances;
            $scope.balances.update = function() {
                rippleRemote.getAccountInfo(clientSession.session().address, function(err, res) {
                    var xrpBalance = res.balance;
                    rippleRemote.getAccountLines(clientSession.session().address, function(err2, res2) {
                        var currencyBalances = res2.lines;
                        currencyBalances.push({
                            currency: 'XRP',
                            balance: xrpBalance
                        });
                        $scope.$apply(function() {
                            $scope.balances.balances = currencyBalances;
                        });
                    });
                });
            }();
            // END BALANCES

            // TRANSACTIONS
            $scope.transactions = {};
            $rootScope.transactions = $scope.transactions;
            $scope.transactions.update = function() {
                rippleRemote.getAccountTransactions(clientSession.session().address, function (err, res) {
                    var transactions = res.transactions;
                    $scope.$apply(function() {
                        $scope.transactions.transactions = transactions;
                    });
                });
            }();
            // END TRANSACTIONS
            
            // CONTACTS
            $scope.contacts = {};
            $rootScope.contacts = $scope.contacts;
            $scope.contacts.update = function() {
                $scope.contacts.contacts = clientSession.session().contacts;
            }();
            // END CONTACTS
        }
    ]);
})();