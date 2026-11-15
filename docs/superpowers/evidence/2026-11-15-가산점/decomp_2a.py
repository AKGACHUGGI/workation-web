"""(2a) 30일 전 W4 + 오늘 활기 검색에서 고성 가산을 갈래별로 분해 (현재값, 화면 quiet, 시군구 2025-10)"""
import math
from boost import *
from scenarios import NOW, w4
P = DEFAULT
items = load('2025-10', 'sigungu'); g = next(u for u in items if u['id'] == '51820'); j = next(u for u in items if u['id'] == '52110')
lv = dict(kind='search', target=None, at=NOW, payload=dict(q='', preset='lively', terrain=[], month=None))
for label, ev in [('30일 전 W4 + 오늘 활기', w4(30) + [lv]), ('30일 전 W4 만', w4(30)), ('오늘 활기 만', [lv])]:
    p = build_profile(ev, NOW, P); s = 1 - math.exp(-p['strength'] / 2)
    for u in (g, j):
        msum = sum(p['metric'].values()); mm = composite(u['scores'], p['metric']) / 100 if msum else 0
        tmax = max(p['terrain'].values()); tm = max(p['terrain'][t] / tmax for t in u['terrain']) if tmax > 0 and u['terrain'] else 0
        pm = 1 - math.exp(-p['place'].get(u['id'], 0))
        print(f"{label:22s} {u['name']}: strength={p['strength']:.3f} s={s:.3f} terrain원값={p['terrain']['coast']:.3f} 지형일치={tm:.2f} | metric {15*.5*s*mm:.2f} terrain {15*.2*s*tm:.2f} place {15*.3*pm:.2f} 합 {boost_for(p, u, P):.2f}")
