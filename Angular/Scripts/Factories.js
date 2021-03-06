﻿HoundsApp.factory("LeagueFactory", ['$rootScope', function ($rootScope) {
    var ref = firebase.database().ref();

    return {
        GetAllLeagues: function (callback) {
            firebase.database().ref('/Leagues/').once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                callback(data);
            });
        }
    }
}])


.factory("SeasonsFactory", ['$rootScope', function ($rootScope) {
    var ref = firebase.database().ref();

    return {
        LatestSeason:{},
        GetCurrentSeasonID: function (callback) {
            firebase.database().ref('/Seasons/').orderByChild("StartDate").once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                var latestSeason = _.sortBy(data, "StartDate").reverse()[0];
                callback(latestSeason.ID);
            });
        },
        GetAllSeasons: function (callback) {
            firebase.database().ref('/Seasons/').once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                callback(data);
            });
        },
        GetCurrentSeasonIDDeferred: function (q) {
            var self = this;
            firebase.database().ref('/Seasons/').orderByChild("StartDate").once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                var latestSeason = _.sortBy(data, "StartDate").reverse()[0];
                self.LatestSeason = latestSeason;
                q.resolve();
            });
        }
    }
}])

.factory("WeeksFactory", ['$rootScope', "SeasonsFactory", function ($rootScope, SeasonsFactory) {
    var ref = firebase.database().ref();

    return {
        GetCombinedWeeks: function (callback) {
            SeasonsFactory.GetCurrentSeasonID(function (data) {
                firebase.database().ref('/Weeks/').orderByChild("SeasonID").equalTo(data).once('value').then(function (snapshot) {
                    var data = [];
                    snapshot.forEach(function (childSnapshot) {
                        var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                        data.push(obj);
                    });
                    callback(data);
                });
            });
        },
        GetAllWeeks: function (callback, LeagueID) {
            SeasonsFactory.GetCurrentSeasonID(function (data) {
                firebase.database().ref('/Weeks/').orderByChild("SeasonID").equalTo(data).once('value').then(function (snapshot) {
                    var data = [];
                    snapshot.forEach(function (childSnapshot) {
                        var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                        data.push(obj);
                    });
                    callback(_.where(data, { "LeagueID": LeagueID }));
                });
            });
        },
        GetAllWeeksBySeason: function (callback, SeasonID, LeagueID) {
            firebase.database().ref('/Weeks/').orderByChild("SeasonID").equalTo(SeasonID).once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                if (LeagueID) {
                    callback(_.where(data, { "LeagueID": LeagueID }));
                } else {
                    callback(data);
                }
            });
        },
        GetWeekDetails: function(callback, WeekID) {
            firebase.database().ref('/Weeks/').child(WeekID).on('value', function (snapshot) {
                var obj = _.extend({ "ID": snapshot.getKey() }, snapshot.val());
                callback(obj);
            });
        },
        UpdateWeek: function (callback, SeasonID, LeagueID, OGB, DGB, Week) {
            this.GetAllWeeks(function (weeks) {
                weeks = _.where(weeks, { "Week": Week });
                var updateObj = {
                    SeasonID: SeasonID,
                    LeagueID: LeagueID,
                    OGB: OGB ? OGB : null,
                    DGB: DGB ? DGB : null,
                    Week: Week
                };
                var weekKey;
                if (weeks.length > 0) {
                    weekKey = weeks[0].ID;
                }
                else {
                    weekKey = firebase.database().ref().child("Weeks").push().key;
                }
                var updates = {};
                updates["/Weeks/" + weekKey] = updateObj;
                firebase.database().ref().update(updates);
                callback(weekKey);
            }, LeagueID);
        }
    }
}])

.factory("StatsFactory", ['$rootScope', "SeasonsFactory", function ($rootScope, SeasonsFactory) {
    var ref = firebase.database().ref();

    return {
        GetStats: function (callback, SeasonID, LeagueID, WeekID) {
            firebase.database().ref('/Stats/').orderByChild("SeasonID").equalTo(SeasonID).once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                callback(_.where(data, { "LeagueID": LeagueID, "WeekID": WeekID }));
            });
        },
        GetSeasonStats: function (callback, SeasonID) {
            firebase.database().ref('/Stats/').orderByChild("SeasonID").equalTo(SeasonID).once('value').then(function (snapshot) {
                var stats = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    stats.push(obj);
                });
                callback(_.groupBy(stats, 'AthleteID'));
            });
        },
        GetSeasonStatsPerLeague: function (callback, SeasonID, LeagueID) {
            firebase.database().ref('/Stats/').orderByChild("SeasonID").equalTo(SeasonID).once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                callback(_.groupBy(_.where(data, { "LeagueID": LeagueID }), 'AthleteID'));
            });
        },
        UpdateStat: function (callback, SeasonID, LeagueID, WeekID, Athlete) {
            this.GetStats(function (stats) {
                var athleteStats = _.where(stats, { "AthleteID": Athlete.ID });
                var updateObj = {
                    SeasonID: SeasonID,
                    LeagueID: LeagueID,
                    AthleteID: Athlete.ID,
                    WeekID: WeekID,
                    Deflections: Athlete.stats.Deflections ? Athlete.stats.Deflections : 0,
                    Interceptions: Athlete.stats.Interceptions ? Athlete.stats.Interceptions : 0,
                    DefensiveTD: Athlete.stats.DefensiveTD ? Athlete.stats.DefensiveTD : 0,
                    FlagPulls: Athlete.stats.FlagPulls ? Athlete.stats.FlagPulls : 0,
                    Sacks: Athlete.stats.Sacks ? Athlete.stats.Sacks : 0,
                    Safety: Athlete.stats.Safety ? Athlete.stats.Safety : 0,
                    Touchdowns: Athlete.stats.Touchdowns ? Athlete.stats.Touchdowns : 0,
                    PassingTD: Athlete.stats.PassingTD ? Athlete.stats.PassingTD : 0,
                    ExtraPoints: Athlete.stats.ExtraPoints ? Athlete.stats.ExtraPoints : 0,
                    PassingXP: Athlete.stats.PassingXP ? Athlete.stats.PassingXP : 0,
                    Receptions: Athlete.stats.Receptions ? Athlete.stats.Receptions : 0,
                    PassingINT: Athlete.stats.PassingINT ? Athlete.stats.PassingINT : 0
                };
                var statId;
                if (athleteStats.length > 0) {
                    statID = athleteStats[0].ID;
                } else {
                    statID = firebase.database().ref().child("Stats").push().key;
                }
                var updates = {};
                updates["/Stats/" + statID] = updateObj;
                firebase.database().ref().update(updates);
                callback(statID);
            }, SeasonID, LeagueID, WeekID);
        }
    }
}])

.factory("AthleteFactory", ['$rootScope', "SeasonsFactory", function ($rootScope, SeasonsFactory) {
    var ref = firebase.database().ref();

    return {
        GetAthletes: function (callback) {
            firebase.database().ref('/Athletes/').orderByChild("isRegularPlayer").once('value').then(function (snapshot) {
                var data = [];
                snapshot.forEach(function (childSnapshot) {
                    var obj = _.extend({ "ID": childSnapshot.getKey() }, childSnapshot.val());
                    data.push(obj);
                });
                callback(data);
            })
        }
    }
}])
;