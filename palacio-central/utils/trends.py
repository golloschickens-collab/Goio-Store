import sys, json
from pytrends.request import TrendReq

kw = sys.argv[1] if len(sys.argv) > 1 else ''
pytrends = TrendReq(hl='es-ES', tz=360)

if kw:
    pytrends.build_payload([kw], cat=0, timeframe='now 7-d', geo='', gprop='')
    # Convert Timestamp to string to make it JSON serializable
    df = pytrends.interest_over_time().reset_index()
    df['date'] = df['date'].astype(str)
    data = df.to_dict(orient='records')
else:
    for region in ('peru', 'united_states', 'japan'):  # fallback en caso un endpoint falle
        try:
            trending = pytrends.trending_searches(pn=region).head(10)[0].tolist()
            data = trending
            break
        except Exception:
            data = []
            continue
    if not data:
        data = [
            "smart home gadgets",
            "wellness planner",
            "pet anxiety relief",
            "portable blender",
            "ergonomic laptop stand",
            "eco-friendly cleaning kit",
            "compact gym set",
            "wireless sleep mask",
            "ai study buddy",
            "digital meal planner"
        ]

print(json.dumps(data))
