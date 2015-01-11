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
                createdAt: new Date(),
                contacts: [],
                setContacts: setContacts
            };
            $rootScope.clientSessionAddress = address;
        };

        var setContacts = function(contacts) {
            session.contacts = [];
            contacts.forEach(function(contact) {
                session.contacts.push({
                    name: contact.name,
                    address: contact.address
                });
            });
        }

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