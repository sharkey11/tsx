# This class will store all players IPOs based off of a CSV of their projections for the year.
# Made by Jack Sharkey - 9/1/19

import csv
import operator
import numpy as np 
import pylab as pl
import collections

class IPO:
    # constants
    percentageSplits = [1,5,9,13,21,30,40,56,76,100]

    def printBarGraphFromPrices(self):
        d = self.allPlayers
        X = np.arange(len(d))
        pl.bar(X, d.values(), align='center', width=0.5)
        pl.xticks(X, d.keys())
        ymax = max(d.values()) + 1
        pl.ylim(0, ymax)
        return pl.show()

    #Sort dictionary into a list of tuples that are ascending based on projections
    def getSortedTuplesFromDictionary(self,playerStats):
        return sorted(playerStats.items(), key=operator.itemgetter(1))


    #Calculate the cutoff point totals for the price ranges.
    #Returns a list of cutoff points
    def determineCutoffs(self, playerStats):
        playersNames, playerProjections = zip(*playerStats)
        # print(playerProjections)
        cutoffs = []
        for percentage in self.percentageSplits:
            cutoffs.append(np.percentile(playerProjections, 100-percentage))
        return cutoffs


    #Assign prices to each percentile based off the number of players in the list and the pricefloor.
    def assignPrices(self, listOfPlayers, priceFloor):
        # print(priceFloor)
        priceDifference = 10 / len(listOfPlayers)
        priceCeiling = priceFloor+10
        index = 1
        for player in listOfPlayers:
            price = priceCeiling - (index * priceDifference)
            index += 1
            self.allPlayers[player[0]] = price

    
    def addPricesToDictionary(self,sortedList,cutoffs):
         #start at the top percentitle cutoff and work down. Price floor is adjusted base off of perecentile
        currentCutoffIndex = 0
        currentPriceFloor = 90 - (10 * currentCutoffIndex)
        playersInRange = []
        index = 0

        #sort through players and split them
        for player in sortedList:
                #if the player belongs in the current percentile, add them
                index += 1
                if (player[1] >= cutoffs[currentCutoffIndex]):
                    playersInRange.append(player)

                    #if this is the last player, add it to the total prices
                    if (index == len(sortedList)):
                        self.assignPrices(playersInRange,currentPriceFloor)
                else:
                    #otherwise, go to the next percentile and add the prices
                    currentCutoffIndex += 1
                    self.assignPrices(playersInRange,currentPriceFloor)
                    playersInRange = []
                    currentPriceFloor = 90 - (10 * currentCutoffIndex)
        #sort dictionary 
        self.allPlayers = collections.OrderedDict(self.getSortedTuplesFromDictionary(self.allPlayers))


    # Parse CSV file into dictionary
    def parseStatsFile(self,fileName):
        with open(fileName, mode='r') as csv_file:
            #define csvreader and start at line 0
            csvReader = csv.DictReader(csv_file)
            playerStats = {}

            #add all players to dictionary
            for row in csvReader:
                #if they are projecred more than 0
                if float(row["points"]) > 0.0:
                  playerStats[row["name"]] = float(row["points"])
                else:
                    self.allPlayers[row["name"]] = 0.0
                
            #sort lists into tuples  
            sortedList = self.getSortedTuplesFromDictionary(playerStats)
            sortedList.reverse()
            #get cutoffs
            self.addPricesToDictionary(sortedList,self.determineCutoffs(sortedList))


    #return price for a given player      
    def getPrice(self,playerName):
        return self.allPlayers.get(playerName)
    
    def getAllPlayersByName(self):
        names = list(self.allPlayers.keys())
        names.reverse()
        return names

    # @param csvFileName - CSV file name containing league stats
    def __init__(self,csvFileName):
        self.allPlayers = {}
        self.parseStatsFile(csvFileName)