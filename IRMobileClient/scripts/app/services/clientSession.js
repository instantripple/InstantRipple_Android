(function() {
    var irApp = angular.module('irApp');

    irApp.factory('clientSession', ['$rootScope', function ($rootScope) {
        var session = {};
        var blob;

        var createEmptySession = function() {
            session = {
                exists: false
            };
            delete $rootScope.clientSessionAddress;
        };
        createEmptySession();

        var start = function (username, address, secret, remoteBlob) {
            blob = remoteBlob;
            session = {
                username: username,
                address: address,
                secret: secret,
                exists: true,
                createdAt: new Date(),
                contacts: [],
                saveContact: saveContactToBlob,
                removeContact: removeContactFromBlob
            };
            $rootScope.clientSessionAddress = address;

            updateContactsView();
        };

        var saveContactToBlob = function (contact) {
            var patchContact = {
                name: contact.name,
                view: contact.address,
                address: contact.address
            }
            if (contact.destinationTag) {
                patchContact.dt = contact.destinationTag;
            }

            blob.filter('/contacts', 'name', patchContact.name, 'extend', '', patchContact);

            updateContactsView();
        };

        var removeContactFromBlob = function(contact) {
            blob.filter('/contacts', 'name', contact.name, 'unset', '');

            updateContactsView();
        };

        var updateContactsView = function() {
            session.contacts = [];
            blob.data.contacts.forEach(function (contact) {
                var newContact = {
                    name: contact.name,
                    address: contact.address
                }
                if (contact.dt) {
                    newContact.destinationTag = contact.dt;
                }
                session.contacts.push(newContact);
            });
        }

        var clear = function() {
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