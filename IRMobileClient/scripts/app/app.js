(function() {
    var irApp = angular.module('irApp', ['ngCordova', 'ionic']);

    irApp.config([
        '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'views/home.html',
                    controller: 'homeController'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html',
                    controller: 'loginController'
                })
                .state('settings', {
                    url: '/settings',
                    templateUrl: 'views/settings.html'
                });
        }
    ]);
})();