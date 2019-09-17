const axios = require('axios');
const apiKey = "0c474511e0b24cd79f0e587a261f4531"
const db = require('./queries')


/*
 This method pulls all ACTIVE player data and loads them into the DB
*/
const pullAthleteBasicInfoActive = () => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Players"
    let attributes = ["playerid", "firstname", "lastname", "photourl", "birthdate", "number,position", "heightfeet", "heightinches", "weight", "globalteamid", "status", "college", "fantasyposition", "age"]
    let tableName = "athletebasic"
    let conflictKey = "playerid"

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls all FREE AGENT player data and loads them into the DB
*/
const pullAthleteBasicInfoFreeAgents = () => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/FreeAgents"
    let attributes = ["playerid", "firstname", "lastname", "photourl", "birthdate", "number,position", "heightfeet", "heightinches", "weight", "globalteamid", "status", "college", "fantasyposition", "age"]
    let tableName = "athletebasic"
    let conflictKey = "playerid"

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls all team data and loads them into the DB
*/
const pullNflTeamData = () => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Teams"
    let attributes = ["key", "city", "name", "stadiumid", "conference", "division", "primarycolor", "secondarycolor", "tertiarycolor", "wikipedialogourl", "globalteamid", "fullname", "headcoach"]
    let tableName = "nflteams"
    let conflictKey = "globalteamid"

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls all schedule data
 @param season
 Year of the season (with optional season type).
 Examples: 2018, 2018PRE, 2018POST, 2018STAR, 2019, etc.
*/
const pullNflScheduleData = (season) => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Schedules/" + season
    let tableName = "nflschedule"
    let attributes = [ "globalhometeamid","globalawayteamid","seasontype","week","datetime","pointspread","overunder","hometeammoneyline","awayteammoneyline","season","scoreid","status","gamekey"]
    let conflictKey = "gamekey"

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls all nflstandings data
 @param season
 Year of the season and the season type. If no season type is provided, then the default is regular season.
 Examples: 2015REG, 2015PRE, 2015POST.
*/
const pullNflStandingsData = (season) => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Standings/" + season
    let attributes = ["globalteamid","season","wins","losses","ties","pointsfor","pointsagainst","divisionwins","divisionlosses","conferencewins","conferencelosses","divisionties","conferenceties"]
    let conflictKey = "globalteamid"
    let tableName = "nflstandings"

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls the a given week's projection data and loads them into the DB
 @param week - week to pull data for
*/
const pullProjectionsByWeek = (week) => {
    let url = "https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2019REG/" + week
    let attributes = ["season", "seasontype", "gamekey", "playerid", "week", "passingattempts", "passingcompletions", "passingyards", "passingcompletionpercentage", "passingyardsperattempt", "passingyardspercompletion", "passingtouchdowns", "passinginterceptions", "passingrating", "passinglong", "passingsacks", "passingsackyards", "rushingattempts", "rushingyards", "rushingyardsperattempt", "rushingtouchdowns", "rushinglong", "receivingtargets", "receptions", "receivingyards", "receivingyardsperreception", "receivingtouchdowns", "receivinglong", "fumbles", "fumbleslost", "puntreturns", "puntreturnyards", "puntreturnyardsperattempt", "puntreturntouchdowns", "puntreturnlong", "kickreturns", "kickreturnyards", "kickreturnyardsperattempt", "kickreturntouchdowns", "kickreturnlong", "solotackles", "assistedtackles", "tacklesforloss", "sacks", "sackyards", "quarterbackhits", "passesdefended", "fumblesforced", "fumblesrecovered", "fumblereturnyards", "fumblereturntouchdowns", "interceptions", "interceptionreturnyards", "interceptionreturntouchdowns", "blockedkicks", "specialteamssolotackles", "specialteamsassistedtackles", "miscsolotackles", "miscassistedtackles", "punts", "puntyards", "puntaverage", "fieldgoalsattempted", "fieldgoalsmade", "fieldgoalslongestmade", "extrapointsmade", "twopointconversionpasses", "twopointconversionruns", "twopointconversionreceptions", "fantasypoints", "fantasypointsppr", "receptionpercentage", "receivingyardspertarget", "tackles", "offensivetouchdowns", "defensivetouchdowns", "specialteamstouchdowns", "touchdowns"]
    let conflictKey = "gamekey,playerid"
    let tableName = "projectionsbyweek"
    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
 This method pulls a given week's players real stats data and loads them into the DB
 @param season - year of the season and the season type. 
 If no season type is provided, then the default is regular season.
 Examples: 2015REG, 2015PRE, 2015POST.
 @param week- week of the season to get data for
 Valid values are as follows: Preseason 0 to 4, Regular Season 1 to 17, Postseason 1 to 4. Example: 1
*/
const pullRealStatsByWeek = (week, season) => {
    let url = "https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/" + season + "/" + week
    let attributes = ["season", "seasontype", "gamekey", "playerid", "week", "passingattempts", "passingcompletions", "passingyards", "passingcompletionpercentage", "passingyardsperattempt", "passingyardspercompletion", "passingtouchdowns", "passinginterceptions", "passingrating", "passinglong", "passingsacks", "passingsackyards", "rushingattempts", "rushingyards", "rushingyardsperattempt", "rushingtouchdowns", "rushinglong", "receivingtargets", "receptions", "receivingyards", "receivingyardsperreception", "receivingtouchdowns", "receivinglong", "fumbles", "fumbleslost", "puntreturns", "puntreturnyards", "puntreturnyardsperattempt", "puntreturntouchdowns", "puntreturnlong", "kickreturns", "kickreturnyards", "kickreturnyardsperattempt", "kickreturntouchdowns", "kickreturnlong", "solotackles", "assistedtackles", "tacklesforloss", "sacks", "sackyards", "quarterbackhits", "passesdefended", "fumblesforced", "fumblesrecovered", "fumblereturnyards", "fumblereturntouchdowns", "interceptions", "interceptionreturnyards", "interceptionreturntouchdowns", "blockedkicks", "specialteamssolotackles", "specialteamsassistedtackles", "miscsolotackles", "miscassistedtackles", "punts", "puntyards", "puntaverage", "fieldgoalsattempted", "fieldgoalsmade", "fieldgoalslongestmade", "extrapointsmade", "twopointconversionpasses", "twopointconversionruns", "twopointconversionreceptions", "fantasypoints", "fantasypointsppr", "receptionpercentage", "receivingyardspertarget", "tackles", "offensivetouchdowns", "defensivetouchdowns", "specialteamstouchdowns", "touchdowns"]
    let conflictKey = "gamekey,playerid"
    let tableName = "realstatsbyweek"
    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
Number of the current week of the NFL season. 
This value usually changes on Tuesday nights or Wednesday mornings at midnight EST. 
Week number is an integer between 1 and 21 or the word current. 
Weeks 1 through 17 are regular season weeks. Weeks 1-4 are post-season weeks.

*/
const getCurrentWeek = () => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/CurrentWeek"
    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let currentWeek = response.data
            return currentWeek;
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
Sync the time frames
*/
const getTimeFrames = () => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Timeframes/all"
    let attributes = ["seasontype", "season", "name", "shortname", "startdate", "enddate", "firstgamestart", "firstgameend", "lastgameend", "hasgames", "hasstarted", "hasended", "hasfirstgamestarted", "haslastgameended", "apiseason", "apiweek"]
    let tableName = "nfltimeframes"
    let conflictKey = "name"
    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes, tableName, conflictKey, data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

/*
Sync the game scores by season
*/
const getGameScores = (season) => {
    let url = "https://api.sportsdata.io/v3/nfl/scores/json/Scores/" + season
    let tableName = "nflgamescores"
    let conflictKey = "gamekey"
    let attributes = ["gamekey", "seasontype", "season", "week", "awayteam", "hometeam", "awayscore", "homescore", "channel", "pointspread", "overunder", "quarter", "timeremaining", "possession", "down", "distance", "yardline", "yardlineterritory", "redzone", "awayscorequarter1", "awayscorequarter2", "awayscorequarter3", "awayscorequarter4", "awayscoreovertime", "homescorequarter1", "homescorequarter2", "homescorequarter3", "homescorequarter4", "homescoreovertime", "hasstarted", "isinprogress", "isover", "has1stquarterstarted", "has2ndquarterstarted", "has3rdquarterstarted", "has4thquarterstarted", "isovertime", "downanddistance", "quarterdescription", "lastupdated", "awayteammoneyline", "hometeammoneyline", "canceled", "closed", "lastplay", "day", "datetime", "awayteamid", "hometeamid", "globalgameid", "globalawayteamid", "globalhometeamid", "scoreid", "status", "gameenddatetime"]

    axios.get(url, {
        params: {
            key: apiKey,
            format: "json"
        }
    })
        .then(function (response) {
            let data = response.data
            for (let i = 0; i < data.length; i++) {
                db.upsertData(attributes,tableName,conflictKey,data[i])
            }
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

//Check the DB if any games are live and update 
const getLiveScoreUpdates = () => {
    return db.checkForLiveGames()
}


// getLiveScoreUpdates()
pullProjectionsByWeek(2)