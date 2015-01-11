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
                ledger: "validated"
            }, function(err, res) {
                callback(err, {
                    balance: parseFloat(res.account_data.Balance / 1000000)
                });
            });
        };

        var requestAccountLines = function(address, callback) {
            remote.requestAccountLines({
                account: address,
                ledger: "validated"
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

        return {
            getAccountInfo: requestAccountInfo,
            getAccountLines: requestAccountLines
        };
    });
})();