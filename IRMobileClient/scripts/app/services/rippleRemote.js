(function () {
    var irApp = angular.module('irApp');

    irApp.factory('rippleRemote', ['$rootScope', '$interval', function ($rootScope, $interval) {
        var remote = new ripple.Remote({
            servers: [{
                host: 's-west.ripple.com',
                port: 443,
                secure: true,
            }],
            trace: false,
            trusted: true,
            local_signing: true,
            local_fee: true,
            fee_cushion: 1.1,
            max_fee: 100000
        });

        var initialize = function() {
            remote.connect(function () {
                remote.requestServerInfo(function (err, res) {
                    reserveXRP = res.info.validated_ledger.reserve_base_xrp;
                });
            });
        }

        var reserveXRP = 0;
        var account = null;
        var invalidator = null;
        var setUser = function (address, secret) {
            remote.setSecret(address, secret);
            account = remote.account(address);
            account.on('transaction-inbound', function (transaction) {
                if (transaction.validated) {
                    var amount;
                    if (transaction.transaction.Amount.currency) {
                        amount = {
                            currency: transaction.transaction.Amount.currency,
                            value: parseFloat(transaction.transaction.Amount.value)
                        };
                    } else {
                        amount = {
                            currency: 'XRP',
                            value: parseFloat(transaction.transaction.Amount / 1000000)
                        };
                    }
                    $rootScope.$broadcast('transaction-received', {
                        amount: amount,
                        sender: transaction.transaction.Account
                    });
                    $rootScope.$broadcast('remote-updated');
                }
            });
            invalidator = $interval(function() {
                $rootScope.$broadcast('remote-invalidated');
            }, 30000);
        }
        var clearUser = function () {
            if (account != null) {
                account.removeAllListeners('transaction-inbound');
                account = null;
            }
            if (invalidator != null) {
                $interval.cancel(invalidator);
                invalidator = null;
            }
        }

        var calcAccountReserve = function (address, callback) {
            remote.requestOwnerCount({ account: address }, function (err, res) {
                callback(err, parseFloat(remote._getServer()._reserve(res).to_human()));
            });
        }

        var requestAccountInfo = function(address, callback) {
            remote.requestAccountInfo({
                account: address,
                ledger: 'validated'
            }, function (err, res) {
                if (err && err.remote && err.remote.error == 'actNotFound') {
                    // The account is unfunded.
                    callback(err, {
                        balance: 0
                    });
                    return;
                }
                callback(err, {
                    balance: parseFloat(res.account_data.Balance / 1000000),
                    requiresDestinationTag: (res.account_data.Flags & 131072)
                });
            });
        };

        var requestAccountLines = function(address, callback) {
            remote.requestAccountLines({
                account: address,
                ledger: 'validate'
            }, function(err, res) {
                var lines = [];
                res.lines.forEach(function(line) {
                    lines.push({
                        currency: line.currency,
                        balance: parseFloat(line.balance),
                        issuer: line.account,
                        limit: line.limit,
                        quality: line.quality_out,
                        canRipple: !line.no_ripple
                    });
                });
                callback(err, {
                    lines: lines
                });
            });
        };

        var requestAccountTransactions = function(address, callback) {
            remote.requestAccountTx({
                account: address,
                ledger_index_min: -1,
                ledger_index_max: -1,
                limit: 400
            }, function (err, res) {
                var transactions = [];
                res.transactions.forEach(function(transaction) {
                    if (transaction.tx.TransactionType === 'Payment' &&
                        (transaction.tx.Account === address ||
                        transaction.tx.Destination === address)) {
                        var amount;
                        if (transaction.tx.Amount.currency) {
                            amount = {
                                currency: transaction.tx.Amount.currency,
                                value: parseFloat(transaction.tx.Amount.value)
                            };
                        } else {
                            amount = {
                                currency: 'XRP',
                                value: parseFloat(transaction.tx.Amount / 1000000)
                            };
                        }
                        transactions.push({
                            amount: amount,
                            sender: transaction.tx.Account,
                            destination: transaction.tx.Destination,
                            time: new Date(ripple.utils.toTimestamp(transaction.tx.date))
                        });
                    }
                });
                callback(err, {
                    transactions: transactions
                });
            });
        };

        var startSend = function (sender, destination, amount, paths, callback) {
            var isXRPToXRP = amount.currency == 'XRP' && paths.amount.currency == 'XRP';
            if (amount.currency == 'XRP') {
                amount = String(amount.value * 1000000);
            } else {
                amount.issuer = destination.address;
                amount.value = String(amount.value);
            }
            amount = ripple.Amount.from_json(amount);

            var sendMax;
            var slippage = 1.01;
            if (paths.amount.currency == 'XRP') {
                sendMax = String(paths.amount.value * slippage * 1000000);
            } else {
                sendMax = {
                    currency: paths.amount.original.currency,
                    issuer: paths.amount.original.issuer,
                    value: String(paths.amount.original.value * slippage)
                };
            }
            sendMax = ripple.Amount.from_json(sendMax);

            var payment = remote.createTransaction('Payment', {
                account: sender,
                destination: destination.address,
                amount: amount
            });
            if (destination.destinationTag) {
                payment.setDestinationTag(destination.destinationTag);
            }
            if (!isXRPToXRP) {
                payment.setPaths(paths.remotePaths);
                payment.setSendMax(sendMax);
            }
            payment.submit(function (err, res) {
                callback(err, res);
            });
        };

        var startPathFind = function (sender, destination, amount) {
            if (amount.currency != 'XRP') {
                amount.issuer = destination;
                amount.value = String(amount.value);
            } else {
                amount = String(amount.value * 1000000);
            }
            amount = ripple.Amount.from_json(amount);
            return remote.path_find(sender, destination, amount);
        };

        return {
            getReserve: function() { return reserveXRP; },
            getAccountReserve: calcAccountReserve,
            setUser: setUser,
            clearUser: clearUser,
            getAccountInfo: requestAccountInfo,
            getAccountLines: requestAccountLines,
            getAccountTransactions: requestAccountTransactions,
            startSend: startSend,
            startPathFind: startPathFind,
            init: initialize
        };
    }]);
})();