(function () {
    var irApp = angular.module('irApp');

    irApp.controller('contactsController', [
        '$scope', 'clientSession', '$ionicLoading',
        function ($scope, clientSession, $ionicLoading) {
            $scope.contacts = clientSession.session().contacts;
        }
    ]);
})();