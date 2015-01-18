(function() {
    var irApp = angular.module('irApp');

    irApp.controller('balancesController', [
        '$scope', 'clientSession', 'rippleRemote', '$ionicLoading', '$timeout',
        function ($scope, clientSession, rippleRemote, $ionicLoading, $timeout) {
            $scope.balances = {};
            var firstLoad = true;

            $scope.balances.update = _.throttle(function () {
                rippleRemote.getAccountInfo(clientSession.session().address, function(err, res) {
                    var xrpBalance = res.balance;
                    rippleRemote.getAccountLines(clientSession.session().address, function(err2, res2) {
                        var lines = res2.lines;
                        var balances = Enumerable.From(lines)
                            .GroupBy('$.currency', null, function(key, x) {
                                return {
                                    currency: key,
                                    balance: x.Sum('$.balance'),
                                    lines: Enumerable.From(lines).Where(function(y) { return y.currency == key; }).ToArray(),
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