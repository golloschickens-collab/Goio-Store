import sys, json
from pytrends.request import TrendReq

kw = sys.argv[1] if len(sys.argv) > 1 else ''
pytrends = TrendReq(hl='es-ES', tz=360)
if kw:
    pytrends.build_payload([kw], cat=0, timeframe='now 7-d', geo='', gprop='')
    data = pytrends.interest_over_time().reset_index().to_dict(orient='records')
else:
    trending = pytrends.trending_searches(pn='global').head(10)[0].tolist()
    data = trending

print(json.dumps(data))