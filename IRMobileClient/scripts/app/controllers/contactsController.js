(function () {
    var irApp = angular.module('irApp');

    irApp.controller('contactsController', [
        '$scope', 'clientSession', '$ionicLoading',
        function ($scope, clientSession, $ionicLoading) {
            $scope.contacts = {};
            $scope.contacts.update = function() {
                $scope.contacts.contacts = clientSession.session().contacts;
            };
            $scope.contacts.update();

        }
    ]);
})();