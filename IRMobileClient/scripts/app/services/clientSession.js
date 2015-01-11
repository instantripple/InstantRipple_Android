(function() {
    var irApp = angular.module('irApp');

    irApp.service('clientSession', function() {
        var createEmptySession = function() {
            this.session = {
                exists: false
            };
        }
        createEmptySession();

        this.start = function(username, address, secret) {
            this.session = {
                username: username,
                address: address,
                secret: secret,
                exists: true,
                createdAt: moment()
            };
        };

        this.clear = function() {
            createEmptySession();
        };
    });
})();