(function() {
    var irApp = angular.module('irApp', ['ngCordova', 'ionic']);

    irApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/home.html'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'views/settings.html'
            });
    }]);
})();