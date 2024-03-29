#Driver class
#Made by Jack Sharkey - 9/1/19
import random
import matplotlib
import matplotlib.pylab as plt
from tkinter import *
import requests

from algorithm.initialPriceOffering import IPO
from algorithm.player import Player

import tkinter as tk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
apiKey = '854387143a914d639a32fc9c9c2ca6e1'

class ShowPlayer:

    def printPlot(self,playerObject):
        data = playerObject.totalPriceData
        lists = data.items() # sorted by key, return a list of tuples
        x, y = zip(*lists) # unpack a list of pairs into two tuples
        
        fig = plt.figure()
        ax = fig.add_subplot(111)
        plt.plot(x,y)
        plt.title(playerObject.getName())
        plt.xlabel("Week")
        plt.ylabel("Price")
        plt.xlim([0,playerObject.totalNumberOfGames])

        for i,j in zip(x,y):
            ax.annotate(str(round(j,2)) ,xy=(i,j))
            
        chart_type = FigureCanvasTkAgg(fig, self.plot)
        chart_type.get_tk_widget().pack()
        
        # messageVar = Label(plot, text = text) 
        # messageVar.pack() 

        buyButton = tk.Button(self.plot, text = "Buy Shares", command=self.buyShares, highlightbackground="#000")
        sellButton = tk.Button(self.plot, text = "Sell Shares", command=self.sellShares, highlightbackground="#000")

        self.e1.pack()
        buyButton.pack()
        sellButton.pack()

        self.plot.mainloop()

    def buyShares(self):
        shares = int(self.e1.get())
        self.player.transaction(shares,True)
        self.printPlot(self.player)

    def sellShares(self):
        print("Sell " + self.e1.get())
   
    def loadPlotData(self):
        self.printPlot(self.playerObject)

    def __init__(self,player):
        self.plot = tk.Tk() 
        self.player = player
        self.e1 = tk.Entry(self.plot, text = "Number of Shares", highlightbackground="#000")
        self.printPlot(player)



class ShowAllPlayers:

    def __init__(self,allPlayersIpoPrices,playerIds):
        self.ipos = allPlayersIpoPrices
        self.playerIds = playerIds;
        self.root = tk.Tk()
        self.openWindow()

    def displayPlayerWindow(self,playerName):
        playerIPOPrice = self.ipos.getPrice(playerName)
        playerObject = Player(playerIPOPrice,playerName,'NFL',self.playerIds[playerName])
        plotData = playerObject.totalPriceData
        playerWindow = ShowPlayer(playerObject)
   
        
    def onselect(self,evt):
        # Note here that Tkinter passes an event object to onselect()
        w = evt.widget
        index = int(w.curselection()[0])
        value = w.get(index)
        playerWindow = self.displayPlayerWindow(value)

    def openWindow(self):
        players = self.ipos.getAllPlayersByName()
        Lb = Listbox(self.root, width = "120", height = "50") 
        index = 1
        for player in players:
            Lb.insert(index,player) 
            index +=1;

    
        Lb.pack() 
        Lb.bind('<<ListboxSelect>>', self.onselect)
        self.root.mainloop() 


class Driver:

    def pullSeasonProjectionData(self):
        payload = {'key': apiKey, 'format' : 'JSON'}
        season = "2019"
        r = requests.get('https://api.sportsdata.io/v3/nfl/projections/json/PlayerSeasonProjectionStats/' + season, params=payload)
        data = r.json()
        allPlayers = []
        for player in data:
            if player["PositionCategory"] == "OFF":
                newPlayer = {}
                newPlayer["PlayerID"] = player['PlayerID']
                newPlayer["Name"] = player['Name']
                newPlayer["Team"] = player['Team']
                newPlayer["FantasyPointsPPR"] = player['FantasyPointsPPR']
                allPlayers.append(newPlayer)

        return allPlayers

    def __init__(self):
        playerData = self.pullSeasonProjectionData()
        self.ipos = IPO(playerData)
        ids = {}
        for player in playerData:
            ids[player["Name"]] = player["PlayerID"]
        allPlayersWindow = ShowAllPlayers(self.ipos,ids)

    def testTransaction(self,playerName):
        ipoPrice = ipos.getPrice(playerName)
        newPlayer = Player(ipoPrice,playerName)
        print(newPlayer.getIpo())
        print(newPlayer.getName())
        print("\n")
        for x in range(10):
            print(newPlayer.transaction(1000,True))

        print("\n")

        for x in range(10):
            print(newPlayer.transaction(1000,False))

    def simulatePriceChanges(self,playerName):
        playerIPO = ipos.getPrice(playerName)
        priceObject = bookValueChange(playerIPO)
        plotData = {}
        weeks = 16
        text = ""
        for x in range(16):
            projected = random.randint(10,30)
            actual = random.randint(10,30)
            originalPrice = priceObject.getPrice()
            newPrice = priceObject.currentPrice
            priceObject.performanceChange(projected,actual)
            plotData[x] = newPrice
            text += "Week " + str(x) + " | Projected: " + str(projected) + " | Actual " + str(actual) + " | Starting Price $" + str(originalPrice) + " | New Price $" + str(newPrice) + "\n"
        printPlot(plotData,playerName,text)

driver = Driver()