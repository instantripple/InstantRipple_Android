(function() {
    var irApp = angular.module('irApp');

    irApp.factory('clientSession', function () {
        var session = {};

        var createEmptySession = function() {
            session = {
                exists: false
            };
        }
        createEmptySession();

        var start = function (username, address, secret) {
            session = {
                username: username,
                address: address,
                secret: secret,
                exists: true,
                createdAt: moment()
            };
        };

        var clear = function () {
            createEmptySession();
        };

        return {
            start: start,
            clear: clear,
            session: session
        };
    });
})();