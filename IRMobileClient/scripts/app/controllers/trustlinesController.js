(function() {
    var irApp = angular.module('irApp');

    irApp.controller('trustlinesController', [
        '$scope', 'rippleRemote', 'clientSession', '$ionicLoading', '$timeout',
        function ($scope, rippleRemote, clientSession, $ionicLoading, $timeout) {
            $scope.trustlines = {};
            var firstLoad = true;

            $scope.trustlines.update = _.throttle(function () {
                if (firstLoad) {
                    $ionicLoading.show();
                }
                rippleRemote.getAccountLines(clientSession.session().address, function(err, res) {
                    var lines = res.lines;
                    var linesByCurrency = Enumerable.From(lines)
                        .GroupBy('$.currency.display', null, function(key, x) {
                            return {
                                currency: key,
                                lines: Enumerable.From(lines).Where(function(y) { return y.currency.display == key; }).ToArray(),
                            };
                        }).ToArray();
                    $timeout(function () {
                        $scope.trustlines.linesByCurrency = linesByCurrency;
                    });
                    if (firstLoad) {
                        firstLoad = false;
                        $ionicLoading.hide();
                    }
                });
            }, 2000);

            $scope.trustlines.update();

            $scope.$on('remote-updated', function () {
                $scope.trustlines.update();
            });
            $scope.$on('remote-invalidated', function () {
                $scope.trustlines.update();
            });
        }
    ]);
})();