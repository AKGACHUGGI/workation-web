"""마지막 측정: CAP15+S+P2+B 와 비교 후보. round3 기준 + (라-1) 수정 정의(안 본 지역 등급 변화만). 사용: python3 round3c.py [sigungu|dong]"""
import sys, json
import round3
from round3 import views, la1, la2, D, C1
from round2 import run_items, sec6
from boost import load
from sweep import MONTHS
from scenarios import NOW, w4

CAND = {
    'CAP15+S+P2+B': dict(D, MIX=(.2, .1, .7), BRANCH_SHARE=True, PLACE_SAT=2.0, METRIC='diff'),
    'CAP15+S+P2': dict(D, MIX=(.2, .1, .7), BRANCH_SHARE=True, PLACE_SAT=2.0),
    'C1+S': dict(C1, BRANCH_SHARE=True),
}
VIEWED = ('51820', '51830')


def la1_unviewed(P, scope):
    lv = dict(kind='search', target=None, at=NOW, payload=dict(q='', preset='lively', terrain=[], month=None))
    cnt = 0
    for m in MONTHS:
        items = load(m, scope)
        _, _, _, gb, _, _ = run_items(P, items, w4(30) + [lv], 'lively')
        _, _, _, gn, _, _ = run_items(P, items, [lv], 'lively')
        for u, a, b in zip(items, gb, gn):
            viewed = u['id'] in VIEWED or (u.get('sigungu') and u['sigungu']['id'] in VIEWED)
            cnt += (a != b) and not viewed
    return cnt


scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
out = {}
print(f'[{scope}] 후보 | 가 1회/3회 | 나 | 다 | 무관/1회 | 라-1 원래/수정 | 라-2 | 6 coast vs 비coast | 통과(원래 라-1) | 통과(수정 라-1)')
for name, P in CAND.items():
    v = views(P, scope); a1 = la1(P, scope); a1u = la1_unviewed(P, scope); a2 = la2(P, scope); s6 = sec6(P, scope)
    base = dict(가=v[1]['share'] >= .7 and v[3]['share'] >= .7, 나=.3 <= v[1]['up'] <= .5, 다=v[3]['up'] >= .8,
                라2=a2 >= .95, 육=s6['coast_unviewed'] > s6['noncoast'])
    n0 = sum(base.values())
    out[name] = dict(views=v, la1=a1, la1_unviewed=a1u, la2=a2, sec6=s6, ok=base)
    print(f"{name:13s} | {v[1]['share']:.0%}/{v[3]['share']:.0%} | {v[1]['up']:.2f} | {v[3]['up']:.2f} | {v[1]['unrel']:.2f} | {a1}/{a1u} | {a2:.2f} | "
          f"{s6['coast_unviewed']:+.2f} vs {s6['noncoast']:+.2f} | {n0 + (a1 == 0)}/6 | {n0 + (a1u == 0)}/6  실패: {[k for k, x in base.items() if not x]}", flush=True)
json.dump(out, open(f'result_round3c_{scope}.json', 'w'), ensure_ascii=False, indent=1)
