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
                        rippleRemote.getAccountLines($scope.send.recipientAddress, function (err, res) {
                            var currencies = Enumerable.From(res.lines).Select('$.currency').Distinct().ToArray();
                            currencies.unshift('XRP');
                            $timeout(function() {
                                $scope.send.currencies = currencies;
                                $scope.send.currency = 'XRP';
                            });
                        });
                        $scope.send.step = 2;
                        break;
                    }
                case 3:
                    {
                        // Start pathfinding.
                        $scope.send.pathFinder = rippleRemote.startPathFind(clientSession.session().address, $scope.send.recipientAddress, {
                            currency: $scope.send.currency,
                            value: $scope.send.amount
                        });
                        $scope.send.pathFinder.on('update', function(update) {
                            var paths = [];
                            update.alternatives.forEach(function(path) {
                                var amount;
                                if (path.source_amount.currency) {
                                    amount = {
                                        currency: path.source_amount.currency,
                                        value: path.source_amount.value
                                    };
                                } else {
                                    amount = parseFloat(path.source_amount / 1000000);
                                }
                                paths.push(
                                {
                                    amount: amount,
                                    remotePath: path.paths_computed
                                });
                            });
                            if ($scope.send.xrpPath) {
                                paths.unshift({
                                    amount: {
                                        currency: 'XRP',
                                        amount: $scope.send.amount
                                    }
                                });
                            }
                            $timeout(function() {
                                $scope.send.lastUpdate = new Date();
                                $scope.send.paths = paths;
                            });
                        });
                        // Check for a direct XRP path.
                        if ($scope.send.currency == 'XRP') {
                            
                        }
                        $scope.send.step = 3;
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
                if ($scope.send.paths) {
                    delete $scope.send.paths;
                }
                if ($scope.send.xrpPath) {
                    delete $scope.send.xrpPath;
                }
                if ($scope.send.amount) {
                    delete $scope.send.amount;
                }
                if ($scope.send.currency) {
                    delete $scope.send.currency;
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