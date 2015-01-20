(function() {
    var irApp = angular.module('irApp');

    irApp.controller('balancesController', [
        '$scope', 'clientSession', 'rippleRemote', '$ionicLoading', '$timeout', '$state', '$ionicHistory',
        function ($scope, clientSession, rippleRemote, $ionicLoading, $timeout, $state, $ionicHistory) {
            $scope.balances = {};
            var firstLoad = true;

            $scope.balances.update = _.throttle(function () {
                rippleRemote.getAccountInfo(clientSession.session().address, function (err, res) {
                    var xrpBalance = res.balance;
                    if (xrpBalance == 0) {
                        // The account is unfunded.
                        $state.go('unfunded');
                        return;
                    }
                    rippleRemote.getAccountLines(clientSession.session().address, function(err2, res2) {
                        var lines = res2.lines;
                        var balances = Enumerable.From(lines)
                            .GroupBy('$.currency.display', null, function(key, x) {
                                return {
                                    currency: key,
                                    balance: x.Sum('$.balance'),
                                    lines: Enumerable.From(lines).Where(function(y) { return y.currency.display == key; }).ToArray(),
                                    showLines: false
                                };
                            })
                            .OrderBy('$.currency').ToArray();
                        balances.unshift({
                            currency: 'XRP',
                            balance: xrpBalance
                        });
                        $timeout(function () {
                            $scope.balances.balances = balances;
                        });
                        if (firstLoad) {
                            firstLoad = false;
                            $ionicHistory.clearHistory();
                            $ionicLoading.hide();
                        }
                    });
                });
            }, 2000);
            $scope.balances.update();

            $scope.$on('remote-updated', function() {
                $scope.balances.update();
            });
            $scope.$on('remote-invalidated', function () {
                $scope.balances.update();
            });
        }
    ]);
})();