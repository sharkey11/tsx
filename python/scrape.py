import requests
import pandas as pd

swid      = '{70AA7B82-5204-4ACF-AA7B-825204FACF36}'
espn_s2   = 'AEBVk0qhezrn0BQeZoi65JeMNPfoTCcdgalq5DTBAUp9F0sqFq%2FNYByFVOUj%2F74P7w0oXhZzvtdaAe3YRYXbTGziHy2HW7o1448gnq9Ey0jYXdnAIxcc0PXN3I%2B4mtVFwY47xzyV02dSqubUXxaM1lSn6zOFS6WrBiHfL1hJ7agpqaHf7FgvoCKyqjoWcjrceczVornPyU9smutOS2PfwVEfxF2%2BqKD%2FbVcKQFiDYOufypt29z7q8qJrzHhAsmV5fgV%2Fe%2BryRmwgHx%2B72msX8MmbtyAUPRpfxLWOzIHLuzGuuw%3D%3D'
league_id = 1234
season    = 2018
week      = 5

slotcodes = {
    0 : 'QB', 2 : 'RB', 4 : 'WR',
    6 : 'TE', 16: 'Def', 17: 'K',
    20: 'Bench', 21: 'IR', 23: 'Flex'
}

url = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/' + \
      str(season) + '/segments/0/leagues/' + str(league_id) + \
      '?view=mMatchup&view=mMatchupScore'

data = []
print('Week ', end='')
for week in range(1, 17):
    print(week, end=' ')

    r = requests.get(url,
                     params={'scoringPeriodId': week},
                     cookies={"SWID": swid, "espn_s2": espn_s2})
    d = r.json()
    
    for tm in d['teams']:
        tmid = tm['id']
        for p in tm['roster']['entries']:
            name = p['playerPoolEntry']['player']['fullName']
            slot = p['lineupSlotId']
            pos  = slotcodes[slot]

            # injured status (need try/exc bc of D/ST)
            inj = 'NA'
            try:
                inj = p['playerPoolEntry']['player']['injuryStatus']
            except:
                pass

            # projected/actual points
            proj, act = None, None
            for stat in p['playerPoolEntry']['player']['stats']:
                if stat['scoringPeriodId'] != week:
                    continue
                if stat['statSourceId'] == 0:
                    act = stat['appliedTotal']
                elif stat['statSourceId'] == 1:
                    proj = stat['appliedTotal']

            data.append([
                week, tmid, name, slot, pos, inj, proj, act
            ])
print('\nComplete.')

data = pd.DataFrame(data, 
                    columns=['Week', 'Team', 'Player', 'Slot', 
                             'Pos', 'Status', 'Proj', 'Actual'])
print(data.head())
print(len(data))
data.to_csv(r'dataExport.csv')

