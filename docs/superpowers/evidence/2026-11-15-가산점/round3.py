"""라운드 3: 고친 기준 판정 (6개 달, 시군구 전부·행정동 1/4 표본). 사용: python3 round3.py [sigungu|dong]
(가) 등급 변화 중 본 지역 몫 ≥70% (1회·3회 둘 다). 시군구는 본 곳, 행정동은 본 동+형제 동
(나) 1회 조회 자기 등급↑율 0.3~0.5   (다) 같은 곳 3회 자기 등급↑율 ≥ 0.8   무관 변화: 1회 조회당 안 본(형제 제외) 등급 변화 평균
(라-1) 30일 전 W4 + 오늘 lively 검색, 화면 lively: (옛+오늘) 등급과 (오늘만) 등급이 다른 항목 수 6개 달 합 = 0
(라-2) 1~4주 전 고성(행정동은 고성 첫 동) 4건 + 오늘 강릉(첫 동) 1건, 화면 quiet: 오늘/옛 가산 6개 달 최소 ≥ 0.95
(6절 상대) 조용·바닷가 검색 + 고성·양양 조회: 안 본 coast 평균 순위상승 > 비coast"""
import sys, statistics as st, json
from boost import *
from sweep import view_events, MONTHS
from scenarios import NOW, w4
from round2 import run_items, sec6, first_dong

D = DEFAULT
Q = PRESET['quiet']
C1 = dict(D, MIX=(.2, .1, .7), METRIC='diff')
C3 = dict(D, MIX=(.2, .1, .7), CAP=12)
CAND = {
    '0 현재': dict(D),
    'C1': C1,
    'C1+CAP12': dict(C1, CAP=12),
    'C3': C3,
    'C1+P1.3': dict(C1, PLACE_SAT=1.3),
    'C1+P1.5': dict(C1, PLACE_SAT=1.5),
    'C1+P1.7': dict(C1, PLACE_SAT=1.7),
    'C1+S': dict(C1, BRANCH_SHARE=True),
    'C3+S': dict(C3, BRANCH_SHARE=True),
    'C3+S+P2': dict(C3, BRANCH_SHARE=True, PLACE_SAT=2.0),
    '0+A3': dict(D, TERR_EMPTY=.5),
    'C1+A3': dict(C1, TERR_EMPTY=.5),
    'C3+A3': dict(C3, TERR_EMPTY=.5),
    'C1+P1.3+A3': dict(C1, PLACE_SAT=1.3, TERR_EMPTY=.5),
    'C1+P1.5+A3': dict(C1, PLACE_SAT=1.5, TERR_EMPTY=.5),
    'C1+P1.7+A3': dict(C1, PLACE_SAT=1.7, TERR_EMPTY=.5),
}


def views(P, scope):
    sample = None if scope == 'sigungu' else 4
    r = {1: [0, 0, 0, 0, 0], 3: [0, 0, 0, 0, 0]}  # own_up, cand, related_changes, all_changes, unrelated_changes
    for m in MONTHS:
        items = load(m, scope)
        for i in (range(len(items)) if sample is None else range(0, len(items), sample)):
            u = items[i]
            rel = {i} | {j for j, v in enumerate(items) if scope == 'dong' and v['sigungu']['id'] == u['sigungu']['id']}
            for n in (1, 3):
                _, bg, b, pg, _, _ = run_items(P, items, view_events(u, scope, n), 'quiet')
                ch = [j for j in range(len(items)) if pg[j] != bg[j]]
                x = r[n]
                if bg[i] != 'S': x[0] += pg[i] != bg[i]; x[1] += 1
                x[2] += sum(j in rel for j in ch); x[3] += len(ch); x[4] += sum(j not in rel for j in ch)
    n_cases = sum(1 for m in MONTHS for _ in (range(len(load(m, scope))) if sample is None else range(0, len(load(m, scope)), sample)))
    return {n: dict(up=x[0] / x[1], share=x[2] / max(1, x[3]), unrel=x[4] / n_cases) for n, x in r.items()}


def la1(P, scope):
    lv = dict(kind='search', target=None, at=NOW, payload=dict(q='', preset='lively', terrain=[], month=None))
    cnt = 0
    for m in MONTHS:
        items = load(m, scope)
        _, _, _, g_both, _, _ = run_items(P, items, w4(30) + [lv], 'lively')
        _, _, _, g_new, _, _ = run_items(P, items, [lv], 'lively')
        cnt += sum(a != b for a, b in zip(g_both, g_new))
    return cnt


def la2(P, scope):
    ratios = []
    for m in MONTHS:
        items = load(m, scope)
        if scope == 'sigungu':
            old = next(u for u in items if u['id'] == '51820'); new = next(u for u in items if u['id'] == '51150'); kind = 'region_view'
        else:
            old, new, kind = first_dong(items, '51820'), first_dong(items, '51150'), 'dong_view'
        mk = lambda u, a: dict(kind=kind, target=u['id'], at=NOW - a * DAY,
                               payload=dict(sigunguId=u['sigungu']['id'] if kind == 'dong_view' else None,
                                            snapshot=dict(month='x', scores=u['scores'], terrain=u['terrain'])))
        _, _, b, _, _, _ = run_items(P, items, [mk(old, a) for a in (28, 21, 14, 7)] + [mk(new, 0)], 'quiet')
        ix = {u['id']: j for j, u in enumerate(items)}
        ratios.append(b[ix[new['id']]] / b[ix[old['id']]])
    return min(ratios)


if __name__ == '__main__':
    scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
    out = {}
    print(f'[{scope}] 후보 | 가 몫 1회/3회 | 나 1회↑율 | 다 3회↑율 | 무관변화/1회 | 라-1 옛 관심 등급변화 | 라-2 오늘/옛 최소 | 6절 coast vs 비coast | 통과')
    for name, P in CAND.items():
        v = views(P, scope); a1 = la1(P, scope); a2 = la2(P, scope); s6 = sec6(P, scope)
        ok = dict(가=v[1]['share'] >= .7 and v[3]['share'] >= .7, 나=.3 <= v[1]['up'] <= .5, 다=v[3]['up'] >= .8,
                  라1=a1 == 0, 라2=a2 >= .95, 육=s6['coast_unviewed'] > s6['noncoast'])
        out[name] = dict(views=v, la1=a1, la2=a2, sec6=s6, ok=ok)
        print(f"{name:12s} | {v[1]['share']:.0%}/{v[3]['share']:.0%} | {v[1]['up']:.2f} | {v[3]['up']:.2f} | {v[1]['unrel']:.2f} | {a1} | {a2:.2f} | "
              f"{s6['coast_unviewed']:+.2f} vs {s6['noncoast']:+.2f} | {''.join(k for k, x in ok.items() if x)} ({sum(ok.values())}/6)", flush=True)
    json.dump(out, open(f'result_round3_{scope}.json', 'w'), ensure_ascii=False, indent=1)
