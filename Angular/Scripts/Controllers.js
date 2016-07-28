var HoundsControllers = angular.module('HoundsControllers', []);

HoundsControllers.controller('LeaguesCtrl', ['$scope', "LeagueFactory", "SeasonsFactory", function ($scope, LeagueFactory, SeasonsFactory) {
    LeagueFactory.GetAllLeagues(function (data) {
        $scope.$apply(function () {
            $scope.Leagues = data;
        });
    });

    SeasonsFactory.GetCurrentSeasonID(function (data) {
        $scope.$apply(function () {
            $scope.SeasonID = data;
        }); 
    });
}])

HoundsControllers.controller('WeeksCtrl', ['$scope', "$routeParams", "WeeksFactory", "AthleteFactory", "StatsFactory", function ($scope, $routeParams, WeeksFactory, AthleteFactory, StatsFactory) {
    WeeksFactory.GetAllWeeks(function (data) {
        $scope.$apply(function () {
            $scope.Weeks = data;
        });
    }, $routeParams.LeagueID)
    $scope.LeagueID = $routeParams.LeagueID;
    $scope.SeasonID = $routeParams.SeasonID;
    $scope.isTotalStats = true;

    AthleteFactory.GetAthletes(function (athletes) {
        StatsFactory.GetSeasonStats(function (stats) {
            var UIAthletes = [];
            _.each(athletes, function (data, key) {
                data.stats = stats[data.ID];
                var totalStats = { Deflections: 0, Interceptions: 0, DefensiveTD: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0 };
                if (data.stats && data.stats.length > 0) {
                    _.each(data.stats, function (week, key) {
                        totalStats.Deflections += week.Deflections;
                        totalStats.Interceptions += week.Interceptions;
                        totalStats.DefensiveTD += week.DefensiveTD;
                        totalStats.FlagPulls += week.FlagPulls;
                        totalStats.Sacks += week.Sacks;
                        totalStats.Safety += week.Safety;
                        totalStats.Touchdowns += week.Touchdowns;
                        totalStats.PassingTD += week.PassingTD;
                        totalStats.ExtraPoints += week.ExtraPoints;
                        totalStats.PassingXP += week.PassingXP;
                        totalStats.Receptions += week.Receptions;
                        totalStats.PassingINT += week.PassingINT;
                    });
                }
                data.stats = totalStats;
                data.isDNP = data.stats == undefined;
                data.AthleteID = key;
                if (data.isDNP && !data.IsRegularPlayer) {
                    return;
                }
                UIAthletes.push(data);
            });
            $scope.$apply(function () {
                $scope.Athletes = UIAthletes;
            });
        }, $routeParams.SeasonID, $routeParams.LeagueID)
    });
}])

HoundsControllers.controller('StatsCtrl', ['$scope', "$routeParams", "StatsFactory", "AthleteFactory", "WeeksFactory", function ($scope, $routeParams, StatsFactory, AthleteFactory, WeeksFactory) {
    AthleteFactory.GetAthletes(function (athletes) {
        StatsFactory.GetStats(function (stats) {
            var UIAthletes = [];
            _.each(athletes, function (data, key) {
                data.stats = _.findWhere(stats, { "AthleteID": data.ID });
                data.isDNP = data.stats == undefined;
                data.AthleteID = key;
                if (data.isDNP && !data.IsRegularPlayer) {
                    return;
                }
                UIAthletes.push(data);
            });
            $scope.$apply(function () {
                $scope.Athletes = UIAthletes;
            });
        }, $routeParams.SeasonID, $routeParams.LeagueID, $routeParams.WeekID)

        WeeksFactory.GetWeekDetails(function (data) {
            $scope.$apply(function () {
                $scope.Week = data;
                $scope.Week.OGB = _.findWhere($scope.Athletes, { "ID": $scope.Week.OGB });
                $scope.Week.DGB = _.findWhere($scope.Athletes, { "ID": $scope.Week.DGB });
            });
        }, $routeParams.WeekID);
    });
}])

HoundsControllers.controller('UpdateCtrl', ['$scope', "$routeParams", "$location", "LeagueFactory", "AthleteFactory", "WeeksFactory", "StatsFactory", function ($scope, $routeParams, $location, LeagueFactory, AthleteFactory, WeeksFactory, StatsFactory) {
    LeagueFactory.GetAllLeagues(function (data) {
        $scope.$apply(function () {
            $scope.Leagues = data;
        });
    }, $routeParams.LeagueID);

    $scope.GetWeeks = function (LeagueID) {
        WeeksFactory.GetAllWeeks(function (data) {
            $scope.$apply(function () {
                $scope.Weeks = data;
            });
        }, LeagueID);
    };

    $scope.GetAthletes = function (Week) {
        AthleteFactory.GetAthletes(function (athletes) {
            StatsFactory.GetStats(function (stats) {
                var UIAthletes = [];
                _.each(athletes, function (data, key) {
                    data.stats = _.findWhere(stats, { "AthleteID": data.ID });
                    data.isDNP = data.stats == undefined;
                    UIAthletes.push(data);
                });
                $scope.$apply(function () {
                    $scope.Athletes = UIAthletes;
                });
            }, Week.SeasonID, $scope.LeagueID, Week.ID)
        });
    };

    $scope.UpdateStat = function (LeagueID, Week, Athlete) {
        StatsFactory.UpdateStat(function () {
            $scope.$apply(function () {
                $location.path("/Stats/" + Week.SeasonID + "/" + LeagueID + "/" + Week.ID);
            });
        }, Week.SeasonID, LeagueID, Week.ID, Athlete);
    };
}])


HoundsControllers.controller('UpdateWeeksCtrl', ['$scope', "$routeParams", "LeagueFactory", "$location", "WeeksFactory", "SeasonsFactory", function ($scope, $routeParams, LeagueFactory, $location, WeeksFactory, SeasonsFactory) {
    LeagueFactory.GetAllLeagues(function (data) {
        $scope.$apply(function () {
            $scope.Leagues = data;
        });
    }, $routeParams.LeagueID);

    SeasonsFactory.GetCurrentSeasonID(function (data) {
        $scope.$apply(function () {
            $scope.SeasonID = data;
        });
    });

    $scope.UpdateWeek = function () {
        WeeksFactory.UpdateWeek(function (WeekID) {
            $scope.$apply(function () {
                $location.path("/Stats/" + $scope.SeasonID + "/" + $scope.LeagueID + "/" + WeekID);
            });
        }, $scope.SeasonID, $scope.LeagueID, $scope.OGB, $scope.DGB, $scope.Week)
    }
}])
;