(function() {
    var irApp = angular.module('irApp');

    irApp.controller('homeController', [
        '$scope', '$rootScope', '$state', 'clientSession', 'rippleRemote',
        function ($scope, $rootScope, $state, clientSession, rippleRemote) {
            $rootScope.showHeader = true;

            // BALANCES & LINES
            $scope.balances = {};
            $scope.lines = {};
            $rootScope.balances = $scope.balances;
            $rootScope.lines = $scope.lines;
            $scope.balances.update = function() {
                rippleRemote.getAccountInfo(clientSession.session().address, function(err, res) {
                    var xrpBalance = res.balance;
                    rippleRemote.getAccountLines(clientSession.session().address, function(err2, res2) {
                        var lines = res2.lines;
                        var balances = Enumerable.From(lines)
                            .GroupBy("$.currency", null, function(key, x) {
                                return {
                                    currency: key,
                                    balance: x.Sum("$.balance")
                                };
                            }).ToArray();
                        balances.push({
                            currency: 'XRP',
                            balance: xrpBalance
                        });
                        $scope.$apply(function () {
                            $scope.lines.lines = lines;
                            $scope.balances.balances = balances;
                        });
                    });
                });
            }();
            // END BALANCES & LINES

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