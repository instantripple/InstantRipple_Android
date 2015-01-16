(function() {
    var irApp = angular.module('irApp');

    irApp.directive('address', ['nameResolver',
        function(nameResolver) {
            return {
                restrict: "A",
                link: function (scope, element, attributes) {
                    var address = attributes.address;
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