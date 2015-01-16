(function() {
    var irApp = angular.module('irApp');

    irApp.directive('address', ['nameResolver',
        function(nameResolver) {
            return {
                restrict: 'A',
                scope: {
                  address: '='  
                },
                link: function (scope, element) {
                    var address = scope.address;
                    element.addClass('address');
                    element.append('<small>' + address + '</small>');
                    nameResolver.resolve(address, function(name) {
                        if (address != name) {
                            element.empty();
                            element.append(name);
                        }
                    });
                }
            };
        }
    ]);
})();