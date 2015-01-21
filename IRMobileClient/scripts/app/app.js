(function () {
    var irApp = angular.module('irApp', ['ngCordova', 'ionic', 'angularMoment', 'autocomplete', 'monospaced.qrcode']);

    var version = '0.5.2.0 (520)';
    if (typeof (window.tinyHippos) == "undefined") {
        window.appVersion = version;
    } else {
        window.appVersion = version + ' - emulated';
    }

    irApp.config([
        '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html',
                    controller: 'loginController',
                    cache: false
                })
                .state('unfunded', {
                    templateUrl: 'views/unfunded.html',
                    controller: 'unfundedController'
                })
                .state('balances', {
                    templateUrl: 'views/balances.html',
                    controller: 'balancesController'
                })
                .state('send', {
                    templateUrl: 'views/send.html',
                    controller: 'sendController'
                })
                .state('transactions', {
                    templateUrl: 'views/transactions.html',
                    controller: 'transactionsController'
                })
                .state('contacts', {
                    templateUrl: 'views/contacts.html',
                    controller: 'contactsController'
                })
                .state('trustlines', {
                    templateUrl: 'views/trustlines.html',
                    controller: 'trustlinesController'
                });
        }
    ]);
})();