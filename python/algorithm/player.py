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
        return print(self.totalPriceData)


    #Calculates the new price based off of the weights of S&D and PV
    # Changes and returns the current price
    def changePriceByWeights(self,SDPrice,PVPrice):
        # print(SDPrice)
        # print(PVPrice)
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

    def __init__(self,ipo,playerName,sport):
        self.currentPrice = round(ipo,2)
        self.ipo = round(ipo,2)
        self.name = playerName
        self.totalShares = 1000
        self.totalPriceData = {}
        self.totalNumberOfGames = self.getTotalNumberOfGames(sport)
        self.totalPriceData[0] = self.ipo
                
    
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
        return (((actual-projection) / projection) / 4)

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
        print(f"Shares:{quantity}")
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
