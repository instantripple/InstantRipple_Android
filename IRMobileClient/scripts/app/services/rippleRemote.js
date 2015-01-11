(function () {
    var irApp = angular.module('irApp');

    irApp.factory('rippleRemote', function () {
        var remote = new ripple.Remote({
            servers: [{
                host: 's-west.ripple.com',
                port: 443,
                secure: true,
            }],
            trace: true,
            trusted: true,
            local_signing: true,
            local_fee: true,
            fee_cushion: 1.1,
            max_fee: 100000
        });
        remote.connect();

        var requestAccountInfo = function(address, callback) {
            remote.requestAccountInfo({
                account: address,
                ledger: 'validated'
            }, function(err, res) {
                callback(err, {
                    balance: parseFloat(res.account_data.Balance / 1000000)
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
                        balance: line.balance,
                        issuer: line.account
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
                                value: transaction.tx.Amount.value
                            };
                        } else {
                            amount = {
                                currency: 'XRP',
                                value: parseFloat(transaction.tx.Amount / 1000000)
                            };
                        }
                        transactions.push({
                            amount: amount,
                            destination: transaction.tx.Destination
                        });
                    }
                });
                callback(err, {
                    transactions: transactions
                });
            });
        };

        return {
            getAccountInfo: requestAccountInfo,
            getAccountLines: requestAccountLines,
            getAccountTransactions: requestAccountTransactions
        };
    });
})();