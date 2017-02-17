var HoundsControllers = angular.module('HoundsControllers', []);

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
            { name: 'stats.offensiveTotal', displayName: "Off. Pts./g", width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.defensiveTotal', displayName: "Def. Pts./g", width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
            { name: 'stats.totalPts', displayName: "Tot. Pts./g", sort: { direction: uiGridConstants.DESC, priority: 1 }, width: 100, type: 'number', cellClass: function (grid, row, col) { return "fantasy" } },
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
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT == $scope.MaxPassingINT ? "maxColValue" : "" } }, ,
            { name: 'stats.BigPlayRec', displayName: "Rec. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayRec == $scope.MaxBigPlayRec ? "maxColValue" : "" } },
            { name: 'stats.BigPlayPass', displayName: "Pass.  20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayPass == $scope.MaxBigPlayPass ? "maxColValue" : "" } },
            { name: 'stats.Drops', displayName: "Drops", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops == $scope.MaxDrops ? "maxColValue" : "" } },
            { name: 'DGB', displayName: "DGB", width: 75, category: "Defense", type: 'number', cellClass: function (grid, row, col) { return row.entity.DGB == $scope.MaxDGB ? "maxColValue" : "" } },
            { name: 'OGB', displayName: "OGB", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.OGB == $scope.MaxOGB ? "maxColValue" : "" } }
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
                        var totalStats = { Deflections: 0, Interceptions: 0, DefensiveTD: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, offensiveTotal: 0, defensiveTotal: 0, totalPts: 0, BigPlayPass: 0, BigPlayRec: 0, Drops: 0 };
                        if (data.stats && data.stats.length > 0) {
                            _.each(data.stats, function (week, key) {
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
                                totalStats.BigPlayRec += week.BigPlayRec;
                                totalStats.BigPlayPass += week.BigPlayPass;
                                totalStats.Drops = += week.Drops;
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
                                statPointsOffense += week.BigPlayRec * $rootScope.BigPlayRecCoef;
                                statPointsOffense += week.BigPlayPass * $rootScope.BigPlayPassCoef;
                                statPointsOffense += week.Drops * $rootScope.Drops;
                                var LeagueName = _.find($rootScope.Weeks, { "ID": week.WeekID }).LeagueName;
                                if (LeagueName != "Recreational") { statPointsOffense *= 1.5; statPointsDefense *= 1.5; }
                                totalStats.offensiveTotal += statPointsOffense;
                                totalStats.defensiveTotal += statPointsDefense;
                            });
                        }
                        totalStats.offensiveTotal = Math.round(totalStats.offensiveTotal/stats[data.ID].length * 100) / 100;
                        totalStats.defensiveTotal = Math.round(totalStats.defensiveTotal / stats[data.ID].length * 100) / 100;
                        totalStats.totalPts = Math.round((totalStats.offensiveTotal + totalStats.defensiveTotal) * 100) / 100;
                        data.stats = totalStats;
                        data.isDNP = data.stats == undefined;
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
                        $scope.MaxBigPlayRec = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.BigPlayRec; })));
                        $scope.MaxBigPlayPass = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.BigPlayPass; })));
                        $scope.MaxDrops = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.stats.Drops; })));
                        $scope.MaxDGB = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.DGB; })));
                        $scope.MaxOGB = Math.max.apply(null, (_.map(UIAthletes, function (item) { return item.OGB; })));
                    });
                }, data);
            });
        });
    });
}])

HoundsControllers.controller('WeeksCtrl', ['$scope', "$routeParams", "$rootScope", "WeeksFactory", "AthleteFactory", "StatsFactory", "uiGridConstants", function ($scope, $routeParams, $rootScope, WeeksFactory, AthleteFactory, StatsFactory, uiGridConstants) {
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
                var totalStats = { Deflections: 0, Interceptions: 0, DefensiveTD: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, BigPlayPass: 0, BigPlayRec: 0 };
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
                        totalStats.BigPlayRec += week.BigPlayRec;
                        totalStats.BigPlayPass += week.BigPlayPass;
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
                                             (data.stats.BigPlayRec * $rootScope.BigPlayRecCoef) + 
                                             (data.stats.Drops * $rootScope.DropsCoef) +
                                             (data.stats.BigPlayPass * $rootScope.BigPlayPassCoef);
                data.stats.OffensivePoints = Math.round(data.stats.OffensivePoints / stats[data.ID].length * 100) / 100;
                data.stats.TotalPoints = data.stats.DefensivePoints + data.stats.OffensivePoints;
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
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT == $scope.MaxPassingINT ? "maxColValue" : "" } },
            { name: 'stats.BigPlayRec', displayName: "Rec. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayRec == $scope.MaxBigPlayRec ? "maxColValue" : "" } },
            { name: 'stats.BigPlayPass', displayName: "Pass. 20+ yds", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayPass == $scope.MaxBigPlayPass ? "maxColValue" : "" } },
            { name: 'stats.Drops', displayName: "Drops", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops == $scope.MaxDrops ? "maxColValue" : "" } }
        ]
    };
}])

HoundsControllers.controller('StatsCtrl', ['$scope', "$routeParams", "$rootScope", "StatsFactory", "AthleteFactory", "WeeksFactory", "uiGridConstants", function ($scope, $routeParams, $rootScope, StatsFactory, AthleteFactory, WeeksFactory, uiGridConstants) {
    AthleteFactory.GetAthletes(function (athletes) {
        StatsFactory.GetStats(function (stats) {
            var UIAthletes = [];
            _.each(athletes, function (data, key) {
                data.stats = _.findWhere(stats, { "AthleteID": data.ID });
                data.isDNP = data.stats == undefined;
                if (data.isDNP) {
                    data.stats = { Deflections: 0, DefensiveTD: 0, Interceptions: 0, FlagPulls: 0, Sacks: 0, Safety: 0, Touchdowns: 0, PassingTD: 0, ExtraPoints: 0, PassingXP: 0, Receptions: 0, PassingINT: 0, BigPlayPass: 0, BigPlayRec: 0, Drops:0 };
                }
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
                                             (data.stats.BigPlayRec * $rootScope.BigPlayRecCoef) +
                                             (data.stats.BigPlayPass * $rootScope.BigPlayPassCoef) +
                                             (data.stats.Drops * $rootScope.Drops);
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
            { name: 'stats.PassingINT', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.PassingINT == $scope.MaxPassingINT ? "maxColValue" : "" } },
            { name: 'stats.BigPlayRec', displayName: "Rec.", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayRec == $scope.MaxBigPlayRec ? "maxColValue" : "" } },
            { name: 'stats.BigPlayPass', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.BigPlayPass == $scope.MaxBigPlayPass ? "maxColValue" : "" } },
            { name: 'stats.Drops', displayName: "Pass. INT", width: 75, category: "Offense", type: 'number', cellClass: function (grid, row, col) { return row.entity.stats.Drops == $scope.MaxDrops ? "maxColValue" : "" } }
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