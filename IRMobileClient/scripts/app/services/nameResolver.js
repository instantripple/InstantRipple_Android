(function () {
    var irApp = angular.module('irApp');

    irApp.factory('nameResolver', ['$http', 'clientService', function ($http, clientService) {
        var nameCache = [];

        var resolveName = function (address, onResolve) {
            // First resolve with contacts.
            var contacts = clientService.session().contacts;
            var possibleAddress = Enumerable.From(contacts).FirstOrDefault(function (x) { return x.address == address; });
            if (address) {
                onResolve(possibleAddress);
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