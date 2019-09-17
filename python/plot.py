import pandas as pd
import plotly.express as px
import numpy

# df = pd.read_csv('data.csv')

# fig = px.line(df, x = 'projection', y = 'actual', title='Apple Share Prices over time (2014)')
# fig.show()
import matplotlib.pylab as plt

import csv
ipo = 100
TOTAL_MARKET_CAP = 1_000_000
changeRateSD = 1.025
moneySpent = 0



def book_value(projection, actual):
    actual = float(actual)
    projection = float(projection)
    return (((actual-projection) / projection) / 4)

def new_price(oldPrice, ratechange):
    return oldPrice + (oldPrice*ratechange)

def priceChangeFromSupplyAndDemand(oldPrice,sharesPurchased):
    global moneySpent
    new_price = oldPrice

    moneySpent += (oldPrice * sharesPurchased)
    multiplyMovement = moneySpent / TOTAL_MARKET_CAP

    # if this move is greater than .01 percent of the TMC, must regroup this
    # print(multiplyMovement)
    if(multiplyMovement >= 0.01):
        while (multiplyMovement >= 0.01):
            # print("Move is bigger. This is " + str(multiplyMovement))
            new_price = (new_price * changeRateSD)
            multiplyMovement -= 0.01
    else:
        fraction = ((multiplyMovement/0.01) * (changeRateSD-1))
        new_price = (new_price * (fraction+1))
    ipo = new_price
    
    return ipo



sharesToBuy = 81

print(f"Market Cap: {TOTAL_MARKET_CAP}")
print(f"Initial Price: {ipo}")
print(f"Shares Purchased: {sharesToBuy}")
print("New Price: " + str(priceChangeFromSupplyAndDemand(ipo,sharesToBuy)))
print("New Price: " + str(priceChangeFromSupplyAndDemand(ipo,sharesToBuy)))
print("New Price: " + str(priceChangeFromSupplyAndDemand(ipo,sharesToBuy)))
print("New Price: " + str(priceChangeFromSupplyAndDemand(ipo,sharesToBuy)))

def printPlot(d):
    lists = d.items() # sorted by key, return a list of tuples
    x, y = zip(*lists) # unpack a list of pairs into two tuples


    fig = plt.figure()
    ax = fig.add_subplot(111)
    plt.plot(x,y)
    plt.title("Lebron James")
    for i,j in zip(x,y):
        ax.annotate(str(j),xy=(i,j))

    plt.show()

with open('data.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    price = ipo
    predictionPrices = {}
    predictionPrices["0"] = ipo

    for row in csv_reader:
        if line_count == 0:
            line_count += 1
        # print(f'Week {line_count}: Projection: \t{row["projection"]}, actual: {row["actual"]}')
        bv = book_value(row["projection"],row["actual"])
        # print(bv)
        price = new_price(price,bv)
        predictionPrices[str(line_count)] = round(price,2)
        # print('New Price: ' +  str(price))
        line_count += 1
        while (line_count == 8 or line_count == 10 or line_count == 11):
            line_count+=1
    printPlot(predictionPrices)




    
