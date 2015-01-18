(function () {
    var irApp = angular.module('irApp');

    irApp.factory('nameResolver', ['$http', 'clientSession', function ($http, clientSession) {
        var nameCache = [];

        var resolveAddress = function(name, onResolve) {
            var session = clientSession.session();
            // Is it our name? No need to lookup.
            if (name == session.name) {
                onResolve(session.address);
                return;
            }
            // Next resolve with contacts.
            var possibleContact = Enumerable.From(session.contacts).FirstOrDefault(false, function (x) { return x.name == name; });
            if (possibleContact) {
                onResolve(possibleContact.address);
                return;
            }
            // Then try Ripple identity.
            if (nameCache[name]) {
                if (nameCache[name].address != null) {
                    onResolve(nameCache[name].address);
                } else {
                    nameCache[name].resolving.push(onResolve);
                }
            } else {
                nameCache[name] = { address: null, resolving: [] };
                $http.get('https://id.ripple.com/v1/user/' + name).success(function (res) {
                    if (res.exists) {
                        nameCache[name].address = res.address;
                    } else {
                        nameCache[name].address = false;
                    }
                    onResolve(nameCache[name].address);
                    nameCache[name].resolving.forEach(function (waitingResolve) {
                        waitingResolve(nameCache[name].address);
                    });
                    nameCache[name].resolving = [];
                });
            }
        };

        var resolveName = function (address, onResolve) {
            if (address.indexOf('~') == 0) {
                resolveAddress(address, onResolve);
                return;
            }

            var session = clientSession.session();
            // Is it our address? No need to lookup.
            if (address == session.address) {
                onResolve(session.username);
                return;
            }
            // Next resolve with contacts.
            var possibleContact = Enumerable.From(session.contacts).FirstOrDefault(false, function (x) { return x.address == address; });
            if (possibleContact) {
                onResolve(possibleContact.name);
                return;
            }
            // Then try Ripple identity.
            if (nameCache[address]) {
                if (nameCache[address].name != null) {
                    onResolve(nameCache[address].name);
                } else {
                    nameCache[address].resolving.push(onResolve);
                }
            } else {
                nameCache[address] = { name: null, resolving: [] };
                $http.get('https://id.ripple.com/v1/user/' + address).success(function(res) {
                    var username = res.username;
                    if (username) {
                        nameCache[address].name = '~' + username;
                    } else {
                        nameCache[address].name = address;
                    }
                    onResolve(nameCache[address].name);
                    nameCache[address].resolving.forEach(function(waitingResolve) {
                        waitingResolve(nameCache[address].name);
                    });
                    nameCache[address].resolving = [];
                });
            }
        }

        return {
            resolve: resolveName
        };
    }]);
})();