//Used to pull data from SportsData.io
const dbUrl = "tsx-1.car2mkg5filp.us-east-2.rds.amazonaws.com"
const dbPassword = "bevothebull"
const currentDb = "tsx"
const axios = require('axios');
const apiKey = "0c474511e0b24cd79f0e587a261f4531"


//Connect to DB
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: dbUrl,
  database: currentDb,
  password: dbPassword,
  port: 5432,
})

//Return a new dictionary with all keys being lowercase
const lowercaseKeys = (obj) => {
  var key, keys = Object.keys(obj);
  var n = keys.length;
  var newobj = {}
  while (n--) {
    key = keys[n];
    newobj[key.toLowerCase()] = obj[key];
  }
  return newobj;
}

//Get all users
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

//Get user info by ID
const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

//Create new user
const createUser = (request, response) => {
  const { firstname, lastname, email } = request.body

  pool.query('INSERT INTO users (firstname,lastname, email) VALUES ($1, $2, $3)', [firstname, lastname, email], (error, results) => {
    if (error) {
      throw error
    }
    console.log(results)
    response.status(201).send(`User added`)
  })
}

//Update user based off id parameter
const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

//Delete user based off id parameter
const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}


//Add basic player info into the tables
const upsertData = (attributes,tableName,conflictKey,data) => {
  //Data we want. Table has been configured to hold these columns.
  
  let query = createUpsertQuery(attributes,tableName,conflictKey,data)

  pool.query(query, (error, results) => {
        if (error) {
          console.log(error)
        }
        return;
      })
    
}



//This method will check if any games have an earlier start time than NOW() (EST) and have not been completed yet
//Outer function
//TODO: Use eastern time zone
const checkForLiveGames = () => {
  let tableName = "nflgamescores"
  let barredStatuses = "('Final','Postponed','Canceled','F/OT')"
  let query = "SELECT * FROM " + tableName + " WHERE datetime < NOW() AND status NOT IN " + barredStatuses + ";"

  pool.query(query, (error, results) => {
    if (error) {
      throw error
    }
    if (results.rowCount > 0) {
      return updateLiveGameScore()
    } else {
      return;
    }
  })
}

//Go get the data that has changed in the past x minutes and update the tables
//Inner function
const updateLiveGameScore = () => {
  let baseUrl = "https://api.sportsdata.io/v3/nfl/stats/json/BoxScoresDeltaV3"
  let season = "/2019REG"
  let week = "/2"
  let playersToShow = "/all"
  let minutes = "/5"
  let url = baseUrl + season + week + playersToShow + minutes

  axios.get(url, {
    params: {
      key: apiKey,
      format: "json"
    }
  })
    .then(function (response) {
      let gameData = response.data
      //update all the game stats 
      syncScoreData(gameData, 0)
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });

}


//Create the query to update the new fields returned from the live box score update for a given tables data
//This method takes in the attributes to update, the game data, the tablename, and foreign key and performs
//an UPSERT on the tables. If the data has not already exisited, it adds it.
//This method creats an UPSERT on a given table based off given attributes to match. The foreignkey is the conflict key.
//Inner function
const createUpsertQuery = (attributes, tableName, conflictKey, data) => {
  data = lowercaseKeys(data)
  let query = "INSERT INTO " + tableName + " ("

  //Loop through data attributes to add and add it to the query
  for (atr in attributes) {
    let attributeName = attributes[atr]
    let newData = data[attributeName]

     //Only will add it if the data is not NULL and the data isn't ""
    if (newData != undefined && (newData != "" || typeof (newData) != "string")) {
      query += attributeName + ","
    }
  }

  //Remove the last comma, add a closing bracket and now write the values
  query = query.substring(0, query.length - 1)
  query += ") VALUES ("

  //Loop through the values and if the value exists (not NULL or ""), write it into the query
  for (atr in attributes) {
    let attributeName = attributes[atr]
    let newData = data[attributeName]
    if (newData != undefined && (newData != "" || typeof (newData) != "string")) {

      //If its a string, we want to add an opening quote
      if (typeof (newData) == "string") {
        query += "'"
      }

       
      //Add an extra ' before any ' in the string.
      if (typeof (newData) == "string") {
        if (newData.includes("'")) {
          let index = newData.indexOf("'")
          newData = newData.substring(0,index) + "'" + newData.substring(index,newData.length)
        }
    }
      //Write the data attribute
      query += newData


      //If its a string, we want to add a closing quote
      if (typeof (newData) == "string") {
        query += "'"
      }
      query += ", "
    }
    
    //If the attribute is the last one in the dict, remove the comma and add the ON CONFLICT
    //
    if (atr == attributes.length - 1) {
      query = query.substring(0, query.length - 2)
      query += ") ON CONFLICT(" + conflictKey + ") DO UPDATE SET "

      //Repeat the process and now define what the new values should be if the row exists
      for (atr in attributes) {
        let attributeName = attributes[atr]
        let newData = data[attributeName]
        if (newData != undefined && (newData != "" || typeof (newData) != "string")) {

          query += attributes[atr] + " = "
          if (typeof (newData) == "string") {
            query += "'"
          }

          //Add an extra ' before any ' in the string.
          if (typeof (newData) == "string") {
            if (newData.includes("'")) {
              let index = newData.indexOf("'")
              newData = newData.substring(0,index) + "'" + newData.substring(index,newData.length)
            }
        }

          query += newData

          if (typeof (newData) == "string") {
            query += "'"
          }
          query += ", "
        }
        //Close it off
        if (atr == attributes.length - 1) {
          query = query.substring(0, query.length - 2)
          query += ";"
        }
      }

    }
  }
  return query;
}


//Loop through the games returned from the BOX SCORE BY DELTA and push it.
//Inner function
const syncScoreData = (allGames, index) => {
  if (index >= allGames.length) {
    return;
  }
  let uniqueGame = allGames[index]
  let attributes = ["gamekey", "awayscore", "homescore", "channel", "pointspread", "overunder", "quarter", "timeremaining", "possession", "down", "distance", "yardline", "yardlineterritory", "redzone", "awayscorequarter1", "awayscorequarter2", "awayscorequarter3", "awayscorequarter4", "awayscoreovertime", "homescorequarter1", "homescorequarter2", "homescorequarter3", "homescorequarter4", "homescoreovertime", "hasstarted", "isinprogress", "isover", "has1stquarterstarted", "has2ndquarterstarted", "has3rdquarterstarted", "has4thquarterstarted", "isovertime", "downanddistance", "quarterdescription", "lastupdated", "awayteammoneyline", "hometeammoneyline", "canceled", "closed", "lastplay", "day", "datetime", "awayteamid", "hometeamid", "globalgameid", "globalawayteamid", "globalhometeamid", "scoreid", "status", "gameenddatetime"]
  let tableName = "nflgamescores"
  let conflictKey = "gamekey"
  let query = createUpsertQuery(attributes,tableName,conflictKey, uniqueGame.Score)

  pool.query(query, (error, results) => {
    if (error) {
      console.log( error)
    }
    //If they have players to update, do it
    if (uniqueGame.PlayerGames.length > 0) {
      syncPlayerDataForRealStats(uniqueGame.PlayerGames,0)
    }
    return syncScoreData(allGames, index + 1)
  })
}

//Loop through the players returned from the BOX SCORE BY DELTA and push it.
//This will update all player data whos playing right now and perform an UPSERT
//Inner function
const syncPlayerDataForRealStats = (allPlayers, index) => {
  if (index >= allPlayers.length) {
    return;
  }
  let data = allPlayers[index]
  let attributes = ["season", "seasontype", "gamekey", "playerid", "week", "passingattempts", "passingcompletions", "passingyards", "passingcompletionpercentage", "passingyardsperattempt", "passingyardspercompletion", "passingtouchdowns", "passinginterceptions", "passingrating", "passinglong", "passingsacks", "passingsackyards", "rushingattempts", "rushingyards", "rushingyardsperattempt", "rushingtouchdowns", "rushinglong", "receivingtargets", "receptions", "receivingyards", "receivingyardsperreception", "receivingtouchdowns", "receivinglong", "fumbles", "fumbleslost", "puntreturns", "puntreturnyards", "puntreturnyardsperattempt", "puntreturntouchdowns", "puntreturnlong", "kickreturns", "kickreturnyards", "kickreturnyardsperattempt", "kickreturntouchdowns", "kickreturnlong", "solotackles", "assistedtackles", "tacklesforloss", "sacks", "sackyards", "quarterbackhits", "passesdefended", "fumblesforced", "fumblesrecovered", "fumblereturnyards", "fumblereturntouchdowns", "interceptions", "interceptionreturnyards", "interceptionreturntouchdowns", "blockedkicks", "specialteamssolotackles", "specialteamsassistedtackles", "miscsolotackles", "miscassistedtackles", "punts", "puntyards", "puntaverage", "fieldgoalsattempted", "fieldgoalsmade", "fieldgoalslongestmade", "extrapointsmade", "twopointconversionpasses", "twopointconversionruns", "twopointconversionreceptions", "fantasypoints", "fantasypointsppr", "receptionpercentage", "receivingyardspertarget", "tackles", "offensivetouchdowns", "defensivetouchdowns", "specialteamstouchdowns", "touchdowns"]
  let tableName = "realstatsbyweek"
  let conflictKey = "playerid,gamekey"
  let query = createUpsertQuery(attributes,tableName,conflictKey,data)
  pool.query(query, (error, results) => {
    if (error) {
      console.log( error)
    }
    return syncPlayerDataForRealStats(allPlayers, index + 1)
  })
}




module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  upsertData,
  checkForLiveGames
}


