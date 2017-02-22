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

HoundsApp.run(["$rootScope", "LeagueFactory", "WeeksFactory", function ($rootScope, LeagueFactory, WeeksFactory) {
    $rootScope.firebaseURL = "https://hounds-56073.firebaseio.com/";

    $rootScope.Weeks = []
    LeagueFactory.GetAllLeagues(function (leagues) {
        for (var l in leagues) {
            WeeksFactory.GetAllWeeks(function (weeks) {
                for (var w in weeks) {
                    weeks[w].LeagueName = _.find(leagues, { ID: weeks[w].LeagueID }).Name;
                    $rootScope.Weeks.push(weeks[w]);
                }
            }, leagues[l].ID);
        }
    });

    $rootScope.DeflectionCoef = 1;
    $rootScope.InterceptionsCoef = 2.5;
    $rootScope.DefensiveTDCoef = 6;
    $rootScope.FlagPullsCoef = 0.5;
    $rootScope.SacksCoef = 1;
    $rootScope.SafetyCoef = 2;
    $rootScope.TouchdownsCoef = 6;
    $rootScope.PassingTDCoef = 4;
    $rootScope.ExtraPointsCoef = 2;
    $rootScope.PassingXPCoef = 2;
    $rootScope.ReceptionsCoef = 0.5;
    $rootScope.RushesCoef = 0.5;
    $rootScope.PassingINTCoef = -2.5;
    $rootScope.Rec20YdsCoef = 2;
    $rootScope.Rush20YdsCoef = 2;
    $rootScope.Pass20YdsCoef = 1;
    $rootScope.DropsCoef = -1;
}]);


(function () {
    'use strict';
    angular.module('HoundsApp').constant('routes', getRoutes()).config(routeConfiguration);
    routeConfiguration.$inject = ['$routeProvider', 'routes'];

    function routeConfiguration($routeProvider, routes) {

        _.each(routes, function (route) {
            $routeProvider.when(route.url, route.config);
        });

        $routeProvider.otherwise({ redirectTo: 'Dashboard' });

    }

    function getRoutes() {
        return [
			{
                url: "/Leagues",
                config: { templateUrl: "Angular/Templates/Leagues.html", controller: "LeaguesCtrl" }
			},
			{
                url: "/Dashboard",
                config: {
                    templateUrl: "Angular/Templates/Dashboard.html",
                    controller: "DashboardCtrl",
                    resolve: {
                        'DashboardCtrl': ['$q', 'SeasonsFactory', function ($q, SeasonsFactory) {
                            var defer = $q.defer();
                            SeasonsFactory.GetCurrentSeasonIDDeferred(defer);
                            return defer.promise;
                        }]
                    },
                }
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
