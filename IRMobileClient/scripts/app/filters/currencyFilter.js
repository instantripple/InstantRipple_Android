(function() {
    var irApp = angular.module('irApp');

    irApp.filter('currency', ['$filter',
        function($filter) {
            return (function (amount, currency) {
                var decimals = 2;
                switch (currency) {
                    case 'XAU':
                    case 'BTC':
                        decimals = 4;
                        break;
                    case 'XRP':
                    case 'STR':
                        decimals = 0;
                        break;
                };

                return $filter('number')(amount, decimals);
            });
        }
    ]);
})();