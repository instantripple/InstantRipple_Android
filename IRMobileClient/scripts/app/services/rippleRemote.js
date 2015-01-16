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

        var checkSend = function(destination, amount, callback) {
            requestAccountLines(destination, function(err, res) {
                
            });
        };

        var commitSend = function(sender, destination, amount, callback) {
            var payment = remote.createTransaction('Payment', {
                account: sender,
                destination: destination,
                amount: amount
            });
            payment.submit(function (err, res) {
                callback(err, res);
            });
        };

        return {
            getAccountInfo: requestAccountInfo,
            getAccountLines: requestAccountLines,
            getAccountTransactions: requestAccountTransactions,
            checkSend: checkSend,
            commitSend: commitSend
        };
    });
})();