"""(1) 검색 프리셋 = 기준 프리셋일 때 지표 갈래가 순위를 못 바꾸는지 (2) 반감기별 감쇠 (3) 달별 W4 기본값 요약"""
import statistics as st
from boost import *
from measure import run, order_pos, MONTHS
from scenarios import SCENARIOS, NOW, w4, rview
from boost import DAY
print('(1) 지표 갈래만 켠 경우(MIX 1/0/0) 자리이동 수 / 등급변화 수, 6개 달 합')
for scen, pre in [('S1 검색(조용·바다)', 'quiet'), ('S5 검색(활기)', 'lively'), ('S1 검색(조용·바다)', 'lively'), ('S5 검색(활기)', 'quiet')]:
    for scope in ['sigungu', 'dong']:
        mv = up = 0
        for m in MONTHS:
            r = run(dict(DEFAULT, MIX=(1, 0, 0)), m, scope, scen, pre); mv += r['moved']; up += r['up']
        print(f'  검색={scen[:6]} 기준프리셋={pre:6s} {scope:7s} 자리이동={mv:4d} 등급변화={up}')
print('(2) W4 의 고성 가산점(시군구 2025-10) 경과일별, 반감기별')
items = load('2025-10', 'sigungu'); gos = next(u for u in items if u['id'] == '51820')
print('  HL  ' + ' '.join(f'{a:>5d}일' for a in [0, 3, 7, 14, 30, 60]))
for hl in [7, 14, 30]:
    P = dict(DEFAULT, HL=hl)
    print(f'  {hl:2d}  ' + ' '.join(f'{boost_for(build_profile(w4(a), NOW, P), gos, P):6.2f}' for a in [0, 3, 7, 14, 30, 60]))
print('  옛 관심(W4 30일 전) + 오늘 활기 검색 1건: 고성 가산점 / 활기 최상위 지역 가산점')
for hl in [7, 14, 30]:
    P = dict(DEFAULT, HL=hl)
    ev = w4(30) + [dict(kind='search', target=None, at=NOW, payload=dict(q='', preset='lively', terrain=[], month=None))]
    p = build_profile(ev, NOW, P); b = {u['name']: boost_for(p, u, P) for u in items}
    top = max(items, key=lambda u: composite(u['scores'], PRESET['lively']))
    print(f'  HL={hl:2d} 고성={b["고성군"]:.2f} {top["name"]}={b[top["name"]]:.2f} 최대가산={max(b.values()):.2f}')
print('(3) 달별 W4(S2) 기본값: 시군구/행정동 자리이동·등급변화·max/sd·spread/gap')
for m in MONTHS:
    a = run(DEFAULT, m, 'sigungu', 'S2 W4(검색+고성·양양)'); d = run(DEFAULT, m, 'dong', 'S2 W4(검색+고성·양양)')
    print(f"  {m:8s} 시군구 이동={a['moved']:2d} 등급↑={a['up']} tau={a['tau']:.3f} max/sd={a['max_over_sd']:.2f} spread/gap={a['spread_over_gap'] or 0:.2f} | 행정동 이동={d['moved']:3d} 등급↑={d['up']:2d} tau={d['tau']:.3f} max/sd={d['max_over_sd']:.2f} spread/gap={d['spread_over_gap'] or 0:.2f}")
