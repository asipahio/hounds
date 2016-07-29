var HoundsControllers = angular.module('HoundsControllers', []);

HoundsControllers.controller('LeaguesCtrl', ['$scope', "$timeout", "LeagueFactory", "SeasonsFactory", "AthleteFactory", "StatsFactory", function ($scope, $timeout, LeagueFactory, SeasonsFactory, AthleteFactory, StatsFactory) {
    LeagueFactory.GetAllLeagues(function (data) {
        $scope.$apply(function () {
            $scope.Leagues = data;
        });
    });

    var rowtpl = '<div ng-class="{ \'isSubPlayer\':!row.entity.IsRegularPlayer }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
    $scope.gridOptions = {
        rowTemplate: rowtpl,
        category: [
            { name: 'Defense', displayName: 'Defense', visible: true, showCatName: false },
            { name: 'Offense', displayName: 'Offense', visible: true, showCatName: false }
        ],
        columnDefs: [
            { name: 'Name', width: 75, pinnedLeft: true },
            { name: 'stats.Deflections', displayName: "Defl.", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Deflections == $scope.MaxDeflections ? "maxColValue" : "" } },
            { name: 'stats.Interceptions', displayName: "Int", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Interceptions == $scope.MaxInterceptions ? "maxColValue" : "" } },
            { name: 'stats.DefensiveTD', displayName: "Def. TD", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.DefensiveTD == $scope.MaxDefensiveTD ? "maxColValue" : "" } },
            { name: 'stats.FlagPulls', displayName: "Flag Pulls", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.FlagPulls == $scope.MaxFlagPulls ? "maxColValue" : "" } },
            { name: 'stats.Sacks', displayName: "Sacks", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Sacks == $scope.MaxSacks ? "maxColValue" : "" } },
            { name: 'stats.Safety', displayName: "Safeties", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Safety == $scope.MaxSafety ? "maxColValue" : "" } },
            { name: 'stats.Touchdowns', displayName: "TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Touchdowns == $scope.MaxTouchdowns ? "maxColValue" : "" } },
            { name: 'stats.PassingTD', displayName: "Pass. TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingTD == $scope.MaxPassingTD ? "maxColValue" : "" } },
            { name: 'stats.ExtraPoints', displayName: "XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.ExtraPoints == $scope.MaxExtraPoints ? "maxColValue" : "" } },
            { name: 'stats.PassingXP', displayName: "Pass. XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingXP == $scope.MaxPassingXP ? "maxColValue" : "" } },
            { name: 'stats.Receptions', displayName: "Rec.", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Receptions == $scope.MaxReceptions ? "maxColValue" : "" } },
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT == $scope.MaxPassingINT ? "maxColValue" : "" } }
        ]
    };

    SeasonsFactory.GetCurrentSeasonID(function (data) {
        $scope.$apply(function () {
            $scope.SeasonID = data;
        });

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
                    $scope.gridOptions.data = UIAthletes;
                    $scope.MaxDeflections = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Deflections; })));
                    $scope.MaxInterceptions = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Interceptions; })));
                    $scope.MaxDefensiveTD = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.DefensiveTD; })));
                    $scope.MaxFlagPulls = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.FlagPulls; })));
                    $scope.MaxSacks = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Sacks; })));
                    $scope.MaxSafety = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Safety; })));
                    $scope.MaxTouchdowns = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Touchdowns; })));
                    $scope.MaxPassingTD = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.PassingTD; })));
                    $scope.MaxExtraPoints = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.ExtraPoints; })));
                    $scope.MaxPassingXP = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.PassingXP; })));
                    $scope.MaxReceptions = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Receptions; })));
                    $scope.MaxPassingINT = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.PassingINT; })));
                });
            }, data);
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
        StatsFactory.GetSeasonStatsPerLeague(function (stats) {
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