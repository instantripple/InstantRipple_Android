(function () {
    var irApp = angular.module('irApp');

    irApp.factory('rippleRemote', function () {
        var remote = new ripple.Remote({
            servers: {
                host: "s-west@ripple.com",
                port: 443,
                secure: true,
            },
            trace: true,
            trusted: true,
            local_signing: true,
            local_fee: true,
            fee_cushion: 1.1,
            max_fee: 100000
        });

        var requestAccountInfo = function(address) {
            remote.requestAccountInfo({
                account: address,
                ledger: "validated"
            }, function(err, res) {
                if (err) {
                    throw err;
                }
                return {
                    balance: parseFloat(res.account_data.Balance / 1000000)
                };
            });
        };

        var requestAccountLines = function(address) {
            remote.requestAccountLines({
                account: address,
                ledger: "validated"
            }, function(err, res) {
                if (err) {
                    throw err;
                }
                return {
                    lines: res.lines
            }
            });
        };

        return {
            getAccountInfo: requestAccountInfo,
            getAccountLines: requestAccountLines
        };
    });
})();