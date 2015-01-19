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
            // 5-6.) Payment confirmation.

            var changeStep = function (step) {
                if (step != $scope.send.step) {
                    switch ($scope.send.step) {
                    case 3:
                        {
                            if ($scope.send.pathFinder) {
                                $scope.send.pathFinder.close();
                                delete $scope.send.pathFinder;
                            }
                            if ($scope.send.xrpPath) {
                                delete $scope.send.xrpPath;
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
                        // Check for a direct XRP path.
                        if ($scope.send.currency == 'XRP') {
                            var address = clientSession.session().address;
                            rippleRemote.getAccountInfo(address, function (err, res) {
                                var xrpBalance = res.balance;
                                rippleRemote.getAccountReserve(address, function (err, accountReserve) {
                                    if ((xrpBalance - accountReserve) >= $scope.send.amount) {
                                        $scope.send.xrpPath = true;
                                    }
                                });
                            });
                        }
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
                                        value: path.source_amount.value,
                                        original: path.source_amount
                                    };
                                } else {
                                    amount = {
                                        currency: 'XRP',
                                        value: parseFloat(path.source_amount / 1000000)
                                    };
                                }
                                paths.push(
                                {
                                    amount: amount,
                                    remotePaths: path.paths_computed
                                });
                            });
                            if ($scope.send.xrpPath) {
                                paths.unshift({
                                    amount: {
                                        currency: 'XRP',
                                        value: parseFloat($scope.send.amount)
                                    }
                                });
                            }
                            $timeout(function() {
                                $scope.send.lastUpdate = new Date();
                                $scope.send.paths = paths;
                            });
                        });
                        $scope.send.step = 3;
                        break;
                    }
                case 4:
                    {
                        $scope.send.step = 4;
                        break;
                    }
                case 5:
                    {
                        rippleRemote.startSend(clientSession.session().address, $scope.send.recipientAddress,
                        {
                            currency: $scope.send.currency,
                            value: $scope.send.amount
                        }, $scope.send.path, function (err, res) {
                            $timeout(function() {
                                if (err) {
                                    $scope.send.isError = true;
                                } else {
                                    $scope.send.isSuccess = true;
                                }
                            });
                            $scope.send.step = 6;
                        });
                        $scope.send.step = 5;
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

            $scope.send.onPathSelected = function (path) {
                $scope.send.path = path;
                changeStep(4);
            }

            $scope.send.onSend = function () {
                changeStep(5);
            }

            $scope.send.goBack = function() {
                changeStep($scope.send.step - 1);
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
                if ($scope.send.pats) {
                    delete $scope.send.path;
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
                if ($scope.send.isError) {
                    delete $scope.send.isError;
                }
                if ($scope.send.isSuccess) {
                    delete $scope.send.isSuccess;
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