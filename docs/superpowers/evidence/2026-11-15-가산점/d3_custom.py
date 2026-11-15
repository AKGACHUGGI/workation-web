"""D3 보강: 직접 설정(custom) 가중치. 지표 1개~5개 모든 조합에서 base+가산 > 100"""
from itertools import combinations
from boost import *
from scenarios import NOW, SCENARIOS
from sweep import MONTHS
for s in ['sigungu', 'dong']:
    cnt = tot = 0; mx = 0; case = None
    for m in MONTHS:
        items = load(m, s)
        for r in range(1, 6):
            for sel in combinations(KEYS, r):
                w = {k: 1 if k in sel else 0 for k in KEYS}
                base = [composite(u['scores'], w) for u in items]
                for sc in ['S2 W4(검색+고성·양양)', 'S4 조회5(고성)', 'S8 동조회1(고성 소속)']:
                    p = build_profile(SCENARIOS[sc][0], NOW, DEFAULT)
                    for (v, g), u in zip(personalize(base, [boost_for(p, u, DEFAULT) for u in items]), items):
                        tot += 1; cnt += v > 100
                        if v > mx: mx, case = v, (m, sel, sc, u['name'])
    print(f'{s}: 100 초과 {cnt}/{tot}, 최댓값 {mx:.2f} {case}')
