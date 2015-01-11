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
                createdAt: new Date()
            };
        };

        var clear = function () {
            createEmptySession();
        };

        var getSession = function() {
            return session;
        }

        return {
            start: start,
            clear: clear,
            session: getSession
        };
    });
})();