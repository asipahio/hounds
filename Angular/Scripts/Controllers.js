var HoundsControllers = angular.module('HoundsControllers', []);

HoundsControllers.controller('DashboardCtrl', ['$scope', "$timeout", "$rootScope", "LeagueFactory", "SeasonsFactory", "AthleteFactory", "StatsFactory", "WeeksFactory", function ($scope, $timeout, $rootScope, LeagueFactory, SeasonsFactory, AthleteFactory, StatsFactory, WeeksFactory) {
    $rootScope.bodyClass = "dashboard";
    $scope.LeagueID = null;
    $scope.WeekID = null;

    $scope.Season = SeasonsFactory.LatestSeason;
    SeasonsFactory.GetAllSeasons(function (data) {
        $scope.$apply(function () {
            $scope.Seasons = data;
        });
    });
    LeagueFactory.GetAllLeagues(function (data) {
        $scope.$apply(function () {
            $scope.Leagues = data;
        });
    });
    $scope.WeeksChanged = function () {
        WeeksFactory.GetAllWeeksBySeason(function (data) {
            $scope.$apply(function () {
                $scope.Weeks = data;
                if ($scope.Athletes) {
                    $scope.GetStats();
                }
            });
        }, $scope.Season.ID, $scope.LeagueID);
    };

    AthleteFactory.GetAthletes(function (athletes) {
        $scope.Athletes = athletes;
        $scope.GetStats();
    });

    $scope.GetStats = function () {
        StatsFactory.GetSeasonStats(function (data) {
            $scope.$apply(function () {
                $scope.Stats = data;
            });
            $scope.GetPoints();
        }, $scope.Season.ID);
    };

    $scope.GetPoints = function () {
        _.each($scope.Athletes, function (data, key) {
            var stats = $scope.Stats[data.ID];
            if ($scope.WeekID !== null && $scope.LeagueID !== null) {
                stats = _.where(stats, { "WeekID": $scope.WeekID, "LeagueID": $scope.LeagueID });
            }
            else if ($scope.WeekID !== null) {
                stats = _.where(stats, { "WeekID": $scope.WeekID });
            }
            else if ($scope.LeagueID !== null) {
                stats = _.where(stats, { "LeagueID": $scope.LeagueID });
            }
            var defensePoints = 0, offensePoints = 0;
            $scope.$apply(function () {
                data.Deflections = _.reduce(stats, function (memo, num) { return memo + num.Deflections; }, 0);
                data.Interceptions = _.reduce(stats, function (memo, num) { return memo + num.Interceptions; }, 0);
                data.DefensiveTD = _.reduce(stats, function (memo, num) { return memo + num.DefensiveTD; }, 0);
                data.FlagPulls = _.reduce(stats, function (memo, num) { return memo + num.FlagPulls; }, 0);
                data.Sacks = _.reduce(stats, function (memo, num) { return memo + num.Sacks; }, 0);
                data.Safety = _.reduce(stats, function (memo, num) { return memo + num.Safety; }, 0);

                defensePoints += data.Deflections * $rootScope.DeflectionCoef;
                defensePoints += data.Interceptions * $rootScope.InterceptionsCoef;
                defensePoints += data.DefensiveTD * $rootScope.DefensiveTDCoef;
                defensePoints += data.FlagPulls * $rootScope.FlagPullsCoef;
                defensePoints += data.Sacks * $rootScope.SacksCoef;
                defensePoints += data.Safety * $rootScope.SafetyCoef;

                data.Touchdowns = _.reduce(stats, function (memo, num) { return memo + num.Touchdowns; }, 0);
                data.PassingTD = _.reduce(stats, function (memo, num) { return memo + num.PassingTD; }, 0);
                data.ExtraPoints = _.reduce(stats, function (memo, num) { return memo + num.ExtraPoints; }, 0);
                data.PassingXP = _.reduce(stats, function (memo, num) { return memo + num.PassingXP; }, 0);
                data.Receptions = _.reduce(stats, function (memo, num) { return memo + num.Receptions; }, 0);
                data.Rushes = _.reduce(stats, function (memo, num) { return memo + (num.Rushes === undefined ? 0 : num.Rushes); }, 0);
                data.PassingINT = _.reduce(stats, function (memo, num) { return memo + num.PassingINT; }, 0);
                data.Rec20Yds = _.reduce(stats, function (memo, num) { return memo + (num.Rec20Yds === undefined ? 0 : num.Rec20Yds); }, 0);
                data.Rush20Yds = _.reduce(stats, function (memo, num) { return memo + (num.Rush20Yds === undefined ? 0 : num.Rush20Yds); }, 0);
                data.Pass20Yds = _.reduce(stats, function (memo, num) { return memo + (num.Pass20Yds === undefined ? 0 : num.Pass20Yds); }, 0);
                data.Drops = _.reduce(stats, function (memo, num) { return memo + (num.Drops === undefined ? 0 : num.Drops); }, 0);

                offensePoints += data.Touchdowns * $rootScope.TouchdownsCoef;
                offensePoints += data.PassingTD * $rootScope.PassingTDCoef;
                offensePoints += data.ExtraPoints * $rootScope.ExtraPointsCoef;
                offensePoints += data.PassingXP * $rootScope.PassingXPCoef;
                offensePoints += data.Receptions * $rootScope.ReceptionsCoef;
                offensePoints += data.Rushes * $rootScope.RushesCoef;
                offensePoints += data.PassingINT * $rootScope.PassingINTCoef;
                offensePoints += data.Rec20Yds * $rootScope.Rec20YdsCoef;
                offensePoints += data.Rush20Yds * $rootScope.Rush20YdsCoef;
                offensePoints += data.Pass20Yds * $rootScope.Pass20YdsCoef;
                offensePoints += data.Drops * $rootScope.DropsCoef;
                data.DefensivePoints = defensePoints;
                data.OffensivePoints = offensePoints;
                data.TotalPoints = offensePoints + defensePoints;
                data.GP = stats === undefined ? 0 : stats.length;
                data.AthleteID = key;
                data.DGB = _.where($scope.Weeks, { "DGB": data.ID }).length;
                data.OGB = _.where($scope.Weeks, { "OGB": data.ID }).length;
            });
        });
    };

    $scope.WeeksChanged();
}]);


HoundsControllers.controller('LeaguesCtrl', ['$scope', "$timeout", "$rootScope", "LeagueFactory", "SeasonsFactory", "AthleteFactory", "StatsFactory", "WeeksFactory", "uiGridConstants", function ($scope, $timeout, $rootScope, LeagueFactory, SeasonsFactory, AthleteFactory, StatsFactory, WeeksFactory, uiGridConstants) {
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
            { name: 'GP', displayName: "GP", width: 75, type: 'number' },
            { name: 'stats.offensiveTotal', displayName: "Off. Pts./g", width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy"; } },
            { name: 'stats.defensiveTotal', displayName: "Def. Pts./g", width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy"; } },
            { name: 'stats.totalPts', displayName: "Tot. Pts./g", sort: { direction: uiGridConstants.DESC, priority: 1 }, width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy"; } },
            { name: 'stats.Deflections', displayName: "Defl.", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Deflections === $scope.MaxDeflections ? "maxColValue" : ""; } },
            { name: 'stats.Interceptions', displayName: "Int", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Interceptions === $scope.MaxInterceptions ? "maxColValue" : ""; } },
            { name: 'stats.DefensiveTD', displayName: "Def. TD", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.DefensiveTD === $scope.MaxDefensiveTD ? "maxColValue" : ""; } },
            { name: 'stats.FlagPulls', displayName: "Flag Pulls", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.FlagPulls === $scope.MaxFlagPulls ? "maxColValue" : ""; } },
            { name: 'stats.Sacks', displayName: "Sacks", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Sacks === $scope.MaxSacks ? "maxColValue" : ""; } },
            { name: 'stats.Safety', displayName: "Safeties", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Safety === $scope.MaxSafety ? "maxColValue" : ""; } },
            { name: 'stats.Touchdowns', displayName: "TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Touchdowns === $scope.MaxTouchdowns ? "maxColValue" : ""; } },
            { name: 'stats.PassingTD', displayName: "Pass. TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingTD === $scope.MaxPassingTD ? "maxColValue" : ""; } },
            { name: 'stats.ExtraPoints', displayName: "XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.ExtraPoints === $scope.MaxExtraPoints ? "maxColValue" : ""; } },
            { name: 'stats.PassingXP', displayName: "Pass. XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingXP === $scope.MaxPassingXP ? "maxColValue" : ""; } },
            { name: 'stats.Receptions', displayName: "Rec.", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Receptions === $scope.MaxReceptions ? "maxColValue" : ""; } },
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT === $scope.MaxPassingINT ? "maxColValue" : ""; } },
            { name: 'stats.Rec20Yds', displayName: "Rec. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Rec20Yds === $scope.MaxRec20Yds ? "maxColValue" : ""; } },
            { name: 'stats.Pass20Yds', displayName: "Pass.  20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Pass20Yds === $scope.MaxPass20Yds ? "maxColValue" : ""; } },
            { name: 'stats.Drops', displayName: "Drops", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops === $scope.MaxDrops ? "maxColValue" : ""; } },
            { name: 'DGB', displayName: "DGB", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.DGB === $scope.MaxDGB ? "maxColValue" : ""; } },
            { name: 'OGB', displayName: "OGB", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.OGB === $scope.MaxOGB ? "maxColValue" : ""; } }
        ]
    };

    SeasonsFactory.GetCurrentSeasonID(function (data) {
        $scope.$apply(function () {
            $scope.SeasonID = data;
        });

        AthleteFactory.GetAthletes(function (athletes) {
            WeeksFactory.GetCombinedWeeks(function (weeks) {
                StatsFactory.GetSeasonStats(function (stats) {
                    var UIAthletes = [];
                    _.each(athletes, function (data, key) {
                        data.stats = stats[data.ID];
                        if (data.stats === undefined) { return; }
                        var totalStats = { Deflections: 0, Interceptions: 0, DefensiveTD: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, offensiveTotal: 0, defensiveTotal: 0, totalPts: 0, Pass20Yds: 0, Rec20Yds: 0, Drops: 0 };
                        if (data.stats && data.stats.length > 0) {
                            _.each(data.stats, function (week, key) {

                                week.Rec20Yds = week.Rec20Yds === undefined ? 0 : week.Rec20Yds;
                                week.Pass20Yds = week.Pass20Yds === undefined ? 0 : week.Pass20Yds;
                                week.Drops = week.Drops === undefined ? 0 : week.Drops;

                                var statPointsDefense = 0, statPointsOffense = 0;
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
                                totalStats.Rec20Yds += week.Rec20Yds;
                                totalStats.Pass20Yds += week.Pass20Yds;
                                totalStats.Drops += week.Drops;
                                statPointsDefense += week.Deflections * $rootScope.DeflectionCoef;
                                statPointsDefense += week.Interceptions * $rootScope.InterceptionsCoef;
                                statPointsDefense += week.DefensiveTD * $rootScope.DefensiveTDCoef;
                                statPointsDefense += week.FlagPulls * $rootScope.FlagPullsCoef;
                                statPointsDefense += week.Sacks * $rootScope.SacksCoef;
                                statPointsDefense += week.Safety * $rootScope.SafetyCoef;
                                statPointsOffense += week.Touchdowns * $rootScope.TouchdownsCoef;
                                statPointsOffense += week.PassingTD * $rootScope.PassingTDCoef;
                                statPointsOffense += week.ExtraPoints * $rootScope.ExtraPointsCoef;
                                statPointsOffense += week.PassingXP * $rootScope.PassingXPCoef;
                                statPointsOffense += week.Receptions * $rootScope.ReceptionsCoef;
                                statPointsOffense += week.PassingINT * $rootScope.PassingINTCoef;
                                statPointsOffense += week.Rec20Yds * $rootScope.Rec20YdsCoef;
                                statPointsOffense += week.Pass20Yds * $rootScope.Pass20YdsCoef;
                                statPointsOffense += week.Drops * $rootScope.DropsCoef;
                                var LeagueName = _.find($rootScope.Weeks, { "ID": week.WeekID }).LeagueName;
                                if (LeagueName !== "Recreational") { statPointsOffense *= 1.5; statPointsDefense *= 1.5; }
                                totalStats.offensiveTotal += statPointsOffense;
                                totalStats.defensiveTotal += statPointsDefense;
                            });
                        }
                        totalStats.offensiveTotal = Math.round(totalStats.offensiveTotal / stats[data.ID].length * 100) / 100;
                        totalStats.defensiveTotal = Math.round(totalStats.defensiveTotal / stats[data.ID].length * 100) / 100;
                        totalStats.totalPts = Math.round((totalStats.offensiveTotal + totalStats.defensiveTotal) * 100) / 100;
                        data.stats = totalStats;
                        data.isDNP = data.stats === undefined;
                        data.AthleteID = key;
                        if (data.isDNP && !data.IsRegularPlayer) {
                            return;
                        }
                        data.GP = stats[data.ID].length;
                        data.DGB = _.where(weeks, { "DGB": data.ID }).length;
                        data.OGB = _.where(weeks, { "OGB": data.ID }).length;
                        UIAthletes.push(data);
                    });
                    $scope.$apply(function () {
                        $scope.Athletes = UIAthletes;
                        $scope.gridOptions.data = UIAthletes;
                        $scope.MaxDeflections = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Deflections; }));
                        $scope.MaxInterceptions = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Interceptions; }));
                        $scope.MaxDefensiveTD = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.DefensiveTD; }));
                        $scope.MaxFlagPulls = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.FlagPulls; }));
                        $scope.MaxSacks = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Sacks; }));
                        $scope.MaxSafety = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Safety; }));
                        $scope.MaxTouchdowns = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Touchdowns; }));
                        $scope.MaxPassingTD = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.PassingTD; }));
                        $scope.MaxExtraPoints = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.ExtraPoints; }));
                        $scope.MaxPassingXP = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.PassingXP; }));
                        $scope.MaxReceptions = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Receptions; }));
                        $scope.MaxPassingINT = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.PassingINT; }));
                        $scope.MaxRec20Yds = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Rec20Yds; }));
                        $scope.MaxPass20Yds = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Pass20Yds; }));
                        $scope.MaxDrops = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.stats.Drops; }));
                        $scope.MaxDGB = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.DGB; }));
                        $scope.MaxOGB = Math.max.apply(null, _.map(UIAthletes, function (item) { return item.OGB; }));
                    });
                }, data);
            });
        });
    });
}]);

HoundsControllers.controller('WeeksCtrl', ['$scope', "$routeParams", "$rootScope", "WeeksFactory", "AthleteFactory", "StatsFactory", "uiGridConstants", function ($scope, $routeParams, $rootScope, WeeksFactory, AthleteFactory, StatsFactory, uiGridConstants) {
    WeeksFactory.GetAllWeeks(function (data) {
        $scope.$apply(function () {
            $scope.Weeks = data;
        });
    }, $routeParams.LeagueID);
    $scope.LeagueID = $routeParams.LeagueID;
    $scope.SeasonID = $routeParams.SeasonID;
    $scope.isTotalStats = true;

    AthleteFactory.GetAthletes(function (athletes) {
        StatsFactory.GetSeasonStatsPerLeague(function (stats) {
            var UIAthletes = [];
            _.each(athletes, function (data, key) {
                data.stats = stats[data.ID];
                if (data.stats === undefined) { return; }
                var totalStats = { Deflections: 0, Interceptions: 0, DefensiveTD: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, Pass20Yds: 0, Rec20Yds: 0, Drops: 0 };
                if (data.stats && data.stats.length > 0) {
                    _.each(data.stats, function (week, key) {

                        week.Rec20Yds = week.Rec20Yds === undefined ? 0 : week.Rec20Yds;
                        week.Pass20Yds = week.Pass20Yds === undefined ? 0 : week.Pass20Yds;
                        week.Drops = week.Drops === undefined ? 0 : week.Drops;

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
                        totalStats.Rec20Yds += week.Rec20Yds;
                        totalStats.Pass20Yds += week.Pass20Yds;
                        totalStats.Drops += week.Drops;
                    });
                }
                data.stats = totalStats;
                data.stats.DefensivePoints = (data.stats.Deflections * $rootScope.DeflectionCoef) +
                                             (data.stats.Interceptions * $rootScope.InterceptionsCoef) +
                                             (data.stats.DefensiveTD * $rootScope.DefensiveTDCoef) +
                                             (data.stats.FlagPulls * $rootScope.FlagPullsCoef) +
                                             (data.stats.Sacks * $rootScope.SacksCoef) +
                                             (data.stats.Safety * $rootScope.SafetyCoef);
                data.stats.DefensivePoints = Math.round(data.stats.DefensivePoints / stats[data.ID].length * 100) / 100;
                data.stats.OffensivePoints = (data.stats.Touchdowns * $rootScope.TouchdownsCoef) +
                                             (data.stats.PassingTD * $rootScope.PassingTDCoef) +
                                             (data.stats.ExtraPoints * $rootScope.ExtraPointsCoef) +
                                             (data.stats.PassingXP * $rootScope.PassingXPCoef) +
                                             (data.stats.Receptions * $rootScope.ReceptionsCoef) +
                                             (data.stats.PassingINT * $rootScope.PassingINTCoef) + 
                                             (data.stats.Rec20Yds * $rootScope.Rec20YdsCoef) + 
                                             (data.stats.Drops * $rootScope.DropsCoef) +
                                             (data.stats.Pass20Yds * $rootScope.Pass20YdsCoef);
                data.stats.OffensivePoints = Math.round(data.stats.OffensivePoints / stats[data.ID].length * 100) / 100;
                data.stats.TotalPoints = data.stats.DefensivePoints + data.stats.OffensivePoints;
                data.isDNP = data.stats === undefined;
                data.AthleteID = key;
                if (data.isDNP && !data.IsRegularPlayer) {
                    return;
                }
                UIAthletes.push(data);
            });
            $scope.$apply(function () {
                $scope.Athletes = UIAthletes;
                $scope.gridOptions.data = UIAthletes;
            });
        }, $routeParams.SeasonID, $routeParams.LeagueID)
    });

    var rowtpl = '<div ng-class="{ \'isSubPlayer\':!row.entity.IsRegularPlayer }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>'
    $scope.gridOptions = {
        rowTemplate: rowtpl,
        columnDefs: [
            { name: 'Name', width: 75, pinnedLeft: true },
            { name: 'stats.DefensivePoints', displayName: "Def. Pts", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.OffensivePoints', displayName: "Off. Pts", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.TotalPoints', sort: { direction: uiGridConstants.DESC, priority: 1 }, displayName: "Tot. Pts", width: 75, type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.Deflections', displayName: "Defl.", width: 75, category: "Defense", type: 'number' },
            { name: 'stats.Interceptions', displayName: "Int", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Interceptions === $scope.MaxInterceptions ? "maxColValue" : "" } },
            { name: 'stats.DefensiveTD', displayName: "Def. TD", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.DefensiveTD === $scope.MaxDefensiveTD ? "maxColValue" : "" } },
            { name: 'stats.FlagPulls', displayName: "Flag Pulls", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.FlagPulls === $scope.MaxFlagPulls ? "maxColValue" : "" } },
            { name: 'stats.Sacks', displayName: "Sacks", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Sacks === $scope.MaxSacks ? "maxColValue" : "" } },
            { name: 'stats.Safety', displayName: "Safeties", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Safety === $scope.MaxSafety ? "maxColValue" : "" } },
            { name: 'stats.Touchdowns', displayName: "TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Touchdowns === $scope.MaxTouchdowns ? "maxColValue" : "" } },
            { name: 'stats.PassingTD', displayName: "Pass. TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingTD === $scope.MaxPassingTD ? "maxColValue" : "" } },
            { name: 'stats.ExtraPoints', displayName: "XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.ExtraPoints === $scope.MaxExtraPoints ? "maxColValue" : "" } },
            { name: 'stats.PassingXP', displayName: "Pass. XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingXP === $scope.MaxPassingXP ? "maxColValue" : "" } },
            { name: 'stats.Receptions', displayName: "Rec.", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Receptions === $scope.MaxReceptions ? "maxColValue" : "" } },
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT === $scope.MaxPassingINT ? "maxColValue" : "" } },
            { name: 'stats.Rec20Yds', displayName: "Rec. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Rec20Yds === $scope.MaxRec20Yds ? "maxColValue" : "" } },
            { name: 'stats.Pass20Yds', displayName: "Pass. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Pass20Yds === $scope.MaxPass20Yds ? "maxColValue" : "" } },
            { name: 'stats.Drops', displayName: "Drops", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops === $scope.MaxDrops ? "maxColValue" : "" } }
        ]
    };
}])

HoundsControllers.controller('StatsCtrl', ['$scope', "$routeParams", "$rootScope", "StatsFactory", "AthleteFactory", "WeeksFactory", "uiGridConstants", function ($scope, $routeParams, $rootScope, StatsFactory, AthleteFactory, WeeksFactory, uiGridConstants) {
    AthleteFactory.GetAthletes(function (athletes) {
        StatsFactory.GetStats(function (stats) {
            var UIAthletes = [];
            _.each(athletes, function (data, key) {
                data.stats = _.findWhere(stats, { "AthleteID": data.ID });
                data.isDNP = data.stats === undefined;
                if (data.isDNP) {
                    data.stats = { Deflections: 0, DefensiveTD: 0, Interceptions: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, Pass20Yds: 0, Rec20Yds: 0, Drops:0 };
                }

                data.stats.Rec20Yds = data.stats.Rec20Yds === undefined ? 0 : data.stats.Rec20Yds;
                data.stats.Pass20Yds = data.stats.Pass20Yds === undefined ? 0 : data.stats.Pass20Yds;
                data.stats.Drops = data.stats.Drops === undefined ? 0 : data.stats.Drops;

                data.stats.DefensivePoints = (data.stats.Deflections * $rootScope.DeflectionCoef) +
                                             (data.stats.Interceptions * $rootScope.InterceptionsCoef) +
                                             (data.stats.DefensiveTD * $rootScope.DefensiveTDCoef) +
                                             (data.stats.FlagPulls * $rootScope.FlagPullsCoef) +
                                             (data.stats.Sacks * $rootScope.SacksCoef) +
                                             (data.stats.Safety * $rootScope.SafetyCoef);
                data.stats.OffensivePoints = (data.stats.Touchdowns * $rootScope.TouchdownsCoef) +
                                             (data.stats.PassingTD * $rootScope.PassingTDCoef) +
                                             (data.stats.ExtraPoints * $rootScope.ExtraPointsCoef) +
                                             (data.stats.PassingXP * $rootScope.PassingXPCoef) +
                                             (data.stats.Receptions * $rootScope.ReceptionsCoef) +
                                             (data.stats.PassingINT * $rootScope.PassingINTCoef) +
                                             (data.stats.Rec20Yds * $rootScope.Rec20YdsCoef) +
                                             (data.stats.Pass20Yds * $rootScope.Pass20YdsCoef) +
                                             (data.stats.Drops * $rootScope.DropsCoef);
                data.stats.TotalPoints = data.stats.DefensivePoints + data.stats.OffensivePoints;
                data.AthleteID = key;
                if (data.isDNP && !data.IsRegularPlayer) {
                    return;
                }
                UIAthletes.push(data);
            });
            $scope.$apply(function () {
                $scope.Athletes = UIAthletes;
                $scope.gridOptions.data = UIAthletes;
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

    var rowtpl = '<div ng-class="{ \'isSubPlayer\':!row.entity.IsRegularPlayer }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
    $scope.gridOptions = {
        rowTemplate: rowtpl,
        columnDefs: [
            { name: 'Name', width: 75, pinnedLeft: true },
            { name: 'stats.DefensivePoints', displayName: "Def. Pts", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.OffensivePoints', displayName: "Off. Pts", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.TotalPoints', sort: { direction: uiGridConstants.DESC, priority: 1 }, displayName: "Tot. Pts", width: 75, type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.Deflections', displayName: "Defl.", width: 75, category: "Defense", type: 'number' },
            { name: 'stats.Interceptions', displayName: "Int", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Interceptions === $scope.MaxInterceptions ? "maxColValue" : "" } },
            { name: 'stats.DefensiveTD', displayName: "Def. TD", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.DefensiveTD === $scope.MaxDefensiveTD ? "maxColValue" : "" } },
            { name: 'stats.FlagPulls', displayName: "Flag Pulls", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.FlagPulls === $scope.MaxFlagPulls ? "maxColValue" : "" } },
            { name: 'stats.Sacks', displayName: "Sacks", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Sacks === $scope.MaxSacks ? "maxColValue" : "" } },
            { name: 'stats.Safety', displayName: "Safeties", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Safety === $scope.MaxSafety ? "maxColValue" : "" } },
            { name: 'stats.Touchdowns', displayName: "TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Touchdowns === $scope.MaxTouchdowns ? "maxColValue" : "" } },
            { name: 'stats.PassingTD', displayName: "Pass. TD", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingTD === $scope.MaxPassingTD ? "maxColValue" : "" } },
            { name: 'stats.ExtraPoints', displayName: "XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.ExtraPoints === $scope.MaxExtraPoints ? "maxColValue" : "" } },
            { name: 'stats.PassingXP', displayName: "Pass. XP", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingXP === $scope.MaxPassingXP ? "maxColValue" : "" } },
            { name: 'stats.Receptions', displayName: "Rec.", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Receptions === $scope.MaxReceptions ? "maxColValue" : "" } },
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT === $scope.MaxPassingINT ? "maxColValue" : "" } },
            { name: 'stats.Rec20Yds', displayName: "Rec. 20+ Yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Rec20Yds === $scope.MaxRec20Yds ? "maxColValue" : "" } },
            { name: 'stats.Pass20Yds', displayName: "Pass. 20+ Yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Pass20Yds === $scope.MaxPass20Yds ? "maxColValue" : "" } },
            { name: 'stats.Drops', displayName: "Drops", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops === $scope.MaxDrops ? "maxColValue" : "" } }
        ]
    };
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
                    data.isDNP = data.stats === undefined;
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