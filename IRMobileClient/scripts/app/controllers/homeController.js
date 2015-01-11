(function() {
    var irApp = angular.module('irApp');

    irApp.controller('homeController', [
        '$scope', '$rootScope', '$state', 'clientSession', 'rippleRemote',
        function ($scope, $rootScope, $state, clientSession, rippleRemote) {
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
        }
    ]);
})();