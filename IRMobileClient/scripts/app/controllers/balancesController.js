(function() {
    var irApp = angular.module('irApp');

    irApp.controller('balancesController', [
        '$scope', 'clientSession', '$timeout', 'rippleRemote',
        function ($scope, clientSession, $timeout, rippleRemote) {
            $scope.balances = {};
            $scope.balances.update = function() {
                rippleRemote.getAccountInfo(clientSession.session().address, function(err, res) {
                    var xrpBalance = res.balance;
                    rippleRemote.getAccountLines(clientSession.session().address, function(err2, res2) {
                        var lines = res2.lines;
                        var balances = Enumerable.From(lines)
                            .GroupBy('$.currency', null, function(key, x) {
                                return {
                                    currency: key,
                                    balance: x.Sum('$.balance'),
                                    lines: Enumerable.From(lines).Where(function (y) { return y.currency == key; }).ToArray(),
                                    showLines: false
                                };
                            })
                            .OrderBy('$.currency').ToArray();
                        balances.unshift({
                            currency: 'XRP',
                            balance: xrpBalance
                        });
                        $scope.$apply(function () {
                            $scope.balances.lines = lines;
                            $scope.balances.balances = balances;
                        });
                    });
                });
                $timeout($scope.balances.update, 60000);
            };

            $scope.balances.update();

            //// CONTACTS
            //$scope.contacts = {};
            //$rootScope.contacts = $scope.contacts;
            //$scope.contacts.update = function() {
            //    $scope.contacts.contacts = clientSession.session().contacts;
            //}();
            //// END CONTACTS
        }
    ]);
})();