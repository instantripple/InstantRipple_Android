(function() {
    var irApp = angular.module('irApp');

    irApp.controller('sendController', [
        '$scope', 'rippleRemote', 'clientSession',
        function ($scope, rippleRemote, clientSession) {
            $scope.send = {};

            $scope.send.changeStep = function(step) {
                switch (step) {
                case 1:
                    {
                        $scope.send.recipients = Enumerable.From(clientSession.session().contacts).Select('$.name').ToArray();
                        $scope.send.step = 1;
                        break;
                    }
                }
            }

            $scope.send.changeStep(1);
        }
    ]);
})();