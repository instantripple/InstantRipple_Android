(function() {
    var irApp = angular.module('irApp');

    irApp.controller('sendController', [
        '$scope', 'rippleRemote', 'clientSession', 'nameResolver', '$timeout',
        function ($scope, rippleRemote, clientSession, nameResolver, $timeout) {
            $scope.send = {};

            var lastRecipient;
            var runCheckRecipient = _.debounce(function () {
                if (!$scope.send.recipient) {
                    return;
                }
                var recipient = $scope.send.recipient;
                if ($scope.send.recipients.indexOf(recipient) > -1) {
                    if (lastRecipient == $scope.send.recipient) {
                        $timeout(function() {
                            $scope.send.recipientAddress = Enumerable.From(clientSession.session().contacts)
                                .First(function(x) { return x.name == recipient; }).address;
                            $scope.send.recipientIsValid = true;
                        });
                    }
                    return;
                }
                else if (recipient.indexOf('~') == 0) {
                    nameResolver.resolve(recipient, function (address) {
                        if (address && lastRecipient == $scope.send.recipient) {
                            $timeout(function () {
                                $scope.send.recipientAddress = address;
                                $scope.send.recipientIsValid = true;
                            });
                        }
                    });
                }
            }, 1500);

            $scope.send.checkRecipient = function () {
                if (lastRecipient == $scope.send.recipient) {
                    return;
                }
                lastRecipient = $scope.send.recipient;
                $scope.send.recipientIsValid = false;
                runCheckRecipient();
            }
            
            // Steps.
            // 1.) Choose recipient.
            // 2.) Enter amount recipient will receive.
            // 3.) Select amount to send.
            // 4.) Check and commit send.
            // 5.) Payment confirmation.

            var changeStep = function (step) {
                if (step != $scope.send.step) {
                    switch ($scope.send.step) {
                    case 3:
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
                        // Scan accepted currencies.
                        rippleRemote.getAccountLines($scope.send.recipientAddress, function(err, res) {
                            $timeout(function() {
                                $scope.send.currencies = Enumerable.From(res.lines).Select('$.currency').Distinct().ToArray();
                                $scope.send.currency = 'XRP';
                            });
                        });
                        $scope.send.step = 2;
                        break;
                    }
                case 3:
                    {
                        $scope.send.pathFinder = rippleRemote.startPathFind(clientSession.session().address, $scope.send.recipientAddress, {
                            currency: $scope.send.currency,
                            value: $scope.send.amount
                        });
                        $scope.send.pathFinder.on('update', function(update) {
                            $scope.send.lastUpdate = new Date();
                            if (update.alternatives.length > 0) {
                                $scope.send.paths = update.alternatives;
                            }
                        });
                        break;
                    }
                case 4:
                    {
                        break;
                    }
                }
            }

            $scope.send.onRecipientSelected = function() {
                changeStep(2);
            }

            $scope.send.onAmountSelected = function() {
                changeStep(3);
            }

            $scope.reset = function () {
                if ($scope.send.recipient) {
                    delete $scope.send.recipient;
                }
                if ($scope.send.pathFinder) {
                    $scope.send.pathFinder.close();
                    delete $scope.send.pathFinder;
                }
                $scope.send.recipientIsValid = false;
                changeStep(1);
            }

            $scope.reset();

            $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                if (fromState.name == 'send') {
                    $scope.reset();
                }
            });
        }
    ]);
})();