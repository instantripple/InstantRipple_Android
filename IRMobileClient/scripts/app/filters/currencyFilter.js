(function() {
    var irApp = angular.module('irApp');

    irApp.filter('currency', ['$filter',
        function($filter) {
            return (function (amount, currency) {
                var decimals = 2;
                if (currency && currency.length >= 3) {
                    switch (currency.substr(0, 3)) {
                        case 'XAU':
                        case 'BTC':
                            decimals = 4;
                            break;
                        case 'XRP':
                        case 'STR':
                            decimals = 1;
                            break;
                    };
                }

                return $filter('number')(amount, decimals);
            });
        }
    ]);
})();