(function() {
    var irApp = angular.module('irApp');

    irApp.controller('sendController', [
        '$scope', 'rippleRemote', 'clientSession',
        function ($scope, rippleRemote, clientSession) {
            $scope.send = {};

            $scope.send.onRecipientSelected = _.debounce(function() {
                var recipient = $scope.send.recipient;
                changeStep(2);
            }, 1500);
            
            var changeStep = function (step) {
                if (step != $scope.send.step) {
                    switch ($scope.send.step) {
                    case 2:
                        {
                            if ($scope.send.pathFinder) {
                                $scope.send.pathFinder.close();
                                delete $scope.send.pathFinder;
                            }
                            break;
                        }
                    }
                }

                switch (step) {
                case 1:
                    {
                        $scope.send.recipients = Enumerable.From(clientSession.session().contacts).Select('$.name').ToArray();
                        $scope.send.step = 1;
                        break;
                    }
                case 2:
                {
                    $scope.send.pathFinder = rippleRemote.startPathFind(clientSession.session().address, $scope.send.recipient, {
                        currency:
                            'XRP',
                        value: 1
                    });
                        $scope.send.pathFinder.on('update', function(update) {
                            $scope.send.lastUpdate = new Date();
                            $scope.send.paths = update.alternatives;
                        });
                    break;
                    }
                }
            }

            $scope.reset = function() {
                changeStep(1);
            }

            $scope.reset();
        }
    ]);
})();