import requests

class Player:
    priceMovementMultiplier = 0.1
    SDWeight = 0.5
    PVWeight = 0.5


    #return the new price and update it
    # @param ratechange is the percentage to multiply the new price to
    def newPrice(self, ratechange):
        return self.currentPrice + (self.currentPrice*ratechange)

    def addPriceToAWeek(self):
        weekToAdd = len(self.totalPriceData)
        self.totalPriceData[weekToAdd] = self.currentPrice
        return self.totalPriceData


    #Calculates the new price based off of the weights of S&D and PV
    # Changes and returns the current price
    def changePriceByWeights(self,SDPrice,PVPrice):
        self.currentPrice =  (SDPrice * self.SDWeight) + (PVPrice * self.PVWeight)
        return self.addPriceToAWeek()
    
    
    #returns total number of games in the players respective sport
    #@param sport is abbreivation
    def getTotalNumberOfGames(self,sport):
        if (sport == "NFL"):
            return 16
        elif (sport == "MLB"):
            return 162
        elif (sport == "NBA" or sport == "NHL"):
            return 82
        else:
            raise Exception("Not a valid sport.")

    def getRealDataForSeasonAndPlayer(self,season):
        url = "https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByPlayerID/" + season + "/"
        payload = {'key': '0c474511e0b24cd79f0e587a261f4531', 'format' : 'JSON'}
        weeklyData = {}
       
        for x in range(1,17):
            tempurl = url + str(x) + "/" + str(self.playerid)
            r = requests.get(tempurl, params=payload)
            if r.text != '':
                data = r.json()
                ppr = data['FantasyPointsPPR']
                weeklyData[x] = ppr
            else:
                weeklyData[x] = 0
        return weeklyData
        
    def getProjectionDataForSeasonAndPlayer(self,season):
        url = "https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByPlayerID/" + season + "/"
        payload = {'key': '0c474511e0b24cd79f0e587a261f4531', 'format' : 'JSON'}
        weeklyData = {}
       
        for x in range(1,17):
            tempurl = url + str(x) + "/" + str(self.playerid)
            r = requests.get(tempurl, params=payload)
            if r.text != '':
                data = r.json()
                ppr = data['FantasyPointsPPR']
                weeklyData[x] = ppr
            else:
                weeklyData[x] = 0
        return weeklyData


    def __init__(self,ipo,playerName,sport,playerid):
        self.currentPrice = round(ipo,2)
        self.ipo = round(ipo,2)
        self.name = playerName
        self.totalShares = 1000
        self.totalPriceData = {}
        self.totalNumberOfGames = self.getTotalNumberOfGames(sport)
        self.totalPriceData[0] = self.ipo
        self.playerid = playerid
        #Go through a given season and get all player stats
        realData = self.getRealDataForSeasonAndPlayer("2018REG")
        projectionData = self.getProjectionDataForSeasonAndPlayer("2018REG")
        print(playerid)
        print(f"Real Data: {realData}")
        print(f"Projection Data: {projectionData}")

        for x in range(1,17):
            self.performanceChange(projectionData[x],realData[x])

    
    #changes the players price and returns it
    # @param projection - player's projected points for a given game
    # @param actual - player's actual points for a given game
    def performanceChange(self,projection,actual):
        difference = self.changeFormula(projection,actual)
        newPrice = round(self.newPrice(difference),2)
        return self.changePriceByWeights(self.currentPrice,newPrice)
    
    # returns the percentage to move a plauyers stock
    # @param projection - player's projected points for a given game
    # @param actual - player's actual points for a given game
    def changeFormula(self,projection,actual):
        projection = float(projection)
        actual = float(actual)
        if (projection != 0):
            return (((actual-projection) / projection) / 4)
        else:
            return 0

    #return players price
    def getPrice(self):
        return str(round(self.currentPrice,2))
    
    #return player's name
    def getName(self):
        return self.name
    
    #returns a rounded version of the players ipo in string form
    def getIpo(self):
        return str(round(self.ipo,2))
    
    #returns the number of shares owned in string form
    def getSharesOwned(self):
        return str(self.totalShares)

    
    #calculate a new price after a transaction is made, update it, and return it
    # @param quantity - number of shares bought or sold
    # @param buy - boolean that if true, shares are being purchased. If false, shares are being sold.
    def transaction(self,quantity,buy):
        newTotalShares = quantity + self.totalShares
        scaleFactor = quantity/newTotalShares
        scaleFactor *= self.priceMovementMultiplier
        priceChange = self.currentPrice * scaleFactor
        newPrice = self.currentPrice

        if buy:
            newPrice += priceChange
            self.totalShares = newTotalShares
        else:
            newPrice -= priceChange
            self.totalShares = self.totalShares - quantity
        return self.changePriceByWeights(newPrice,self.currentPrice)
