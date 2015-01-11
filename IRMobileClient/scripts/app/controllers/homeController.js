(function() {
    var irApp = angular.module('irApp');

    irApp.controller('homeController', [
        '$state', 'clientSession',
        function ($state, clientSession) {
            if (!clientSession.session().exists) {
                $state.go('login');
            }
        }
    ]);
})();