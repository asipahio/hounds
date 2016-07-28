var HoundsApp = angular.module('HoundsApp', [
    "ngRoute",
    "ui.bootstrap",
    "HoundsControllers",
    "firebase",
    'ngTouch',
    'ui.grid',
    'ui.grid.pinning',
    'ui.grid.grouping'
    //"angular-loading-bar",
]);

HoundsApp.config(['$locationProvider', '$compileProvider', function ($locationProvider, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|ssh|file):/);
    $locationProvider.html5Mode(false);
}]);

HoundsApp.run(["$rootScope", function ($rootScope) {
    $rootScope.firebaseURL = "https://hounds-56073.firebaseio.com/";
}]);


(function () {
    'use strict';
    angular.module('HoundsApp').constant('routes', getRoutes()).config(routeConfiguration);
    routeConfiguration.$inject = ['$routeProvider', 'routes'];

    function routeConfiguration($routeProvider, routes) {

        _.each(routes, function (route) {
            $routeProvider.when(route.url, route.config);
        });

        $routeProvider.otherwise({ redirectTo: 'Leagues' });

    }

    function getRoutes() {
        return [
			{
			    url: "/Leagues",
			    config: { templateUrl: "Angular/Templates/Leagues.html", controller: "LeaguesCtrl" }

			},
            {
                url: "/Weeks/:SeasonID/:LeagueID",
                config: { templateUrl: "Angular/Templates/Weeks.html", controller: "WeeksCtrl" }

            },
            {
                url: "/Stats/:SeasonID/:LeagueID/:WeekID",
                config: { templateUrl: "Angular/Templates/Stats.html", controller: "StatsCtrl" }

            },
            {
                url: "/Update",
                config: { templateUrl: "Angular/Templates/Update.html", controller: "UpdateCtrl" }

            },
            {
                url: "/UpdateWeeks",
                config: { templateUrl: "Angular/Templates/UpdateWeeks.html", controller: "UpdateWeeksCtrl" }

            }
        ]
    }
})();
