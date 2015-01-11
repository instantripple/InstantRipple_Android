(function() {
    var irApp = angular.module('irApp');

    irApp.factory('clientSession', ['$rootScope', function ($rootScope) {
        var session = {};

        var createEmptySession = function() {
            session = {
                exists: false
            };
            delete $rootScope.clientSessionAddress;
        }();

        var start = function (username, address, secret) {
            session = {
                username: username,
                address: address,
                secret: secret,
                exists: true,
                createdAt: new Date()
            };
            $rootScope.clientSessionAddress = address;
        };

        var clear = function () {
            createEmptySession();
        };

        var getSession = function() {
            return session;
        };

        return {
            start: start,
            clear: clear,
            session: getSession
        };
    }]);
})();