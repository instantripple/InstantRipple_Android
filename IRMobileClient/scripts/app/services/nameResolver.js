(function () {
    var irApp = angular.module('irApp');

    irApp.factory('nameResolver', ['$http', function ($http) {
        var nameCache = [];

        var resolveName = function (address, onResolve) {
            // First resolve with contacts.

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