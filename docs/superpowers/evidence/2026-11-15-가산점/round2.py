"""반박 라운드 2 + attacker 변형 A~D. 6개 달, 시군구·행정동(행정동 조회 표본 1/4).
사용: python3 round2.py [sigungu|dong]
(1) 등급 변화 중 본 지역 몫(행정동은 형제 동 별도) (2) 1회·5회 가산/CAP
(2a) 30일 전 W4 + 오늘 활기 검색: 화면 quiet / 화면 lively(검색과 같음). 옛 관심 가산 / 활기 상위 3곳 평균 가산, 안 본 지역 등급 변화
(2b) 4주 주1회 5건 / 하루 5건, (2c) 1~4주 전 고성 4건 + 오늘 강릉(행정동: 강릉 소속 첫 동) 1건
(6절) 조용·바닷가 검색 + 고성·양양 조회 뒤 안 본 coast 지역 평균 순위 변화 vs 안 본 비coast, coast∧quiet 상위 절반 vs 그 밖"""
import sys, statistics as st, json
from boost import *
from measure import order_pos
from sweep import view_events, MONTHS
from scenarios import NOW, w4, rview, search
from boost import DAY

D = DEFAULT
Q, L = PRESET['quiet'], PRESET['lively']
A = dict(HL=7, HL_PLACE=21, MAX_AGE=90)
CAND = {
    '0 현재': dict(D),
    'D .2/.1/.7': dict(D, MIX=(.2, .1, .7)),
    'A 반감기분리': dict(D, **A),
    'B1 차이형x2 .5/.2/.3': dict(D, METRIC='diff', METRIC_SCALE=2),
    'B2 차이형x2 .3/.1/.6': dict(D, METRIC='diff', METRIC_SCALE=2, MIX=(.3, .1, .6)),
    'C(A+B1)': dict(D, METRIC='diff', METRIC_SCALE=2, **A),
    'C(A+B2)': dict(D, METRIC='diff', METRIC_SCALE=2, MIX=(.3, .1, .6), **A),
    'C1 .2/.1/.7+차이형': dict(D, MIX=(.2, .1, .7), METRIC='diff'),
    'C3 .2/.1/.7 CAP12': dict(D, MIX=(.2, .1, .7), CAP=12),
    'C1+A': dict(D, MIX=(.2, .1, .7), METRIC='diff', **A),
    'C3+A': dict(D, MIX=(.2, .1, .7), CAP=12, **A),
    'C1+S 갈래몫': dict(D, MIX=(.2, .1, .7), METRIC='diff', BRANCH_SHARE=True),
    'C3+S 갈래몫': dict(D, MIX=(.2, .1, .7), CAP=12, BRANCH_SHARE=True),
    'C3+S+P2 (place 포화 2)': dict(D, MIX=(.2, .1, .7), CAP=12, BRANCH_SHARE=True, PLACE_SAT=2.0),
}
import os
if os.environ.get('ONLY'):
    CAND = {k: v for k, v in CAND.items() if k.startswith(tuple(os.environ['ONLY'].split(',')))}


def run_items(P, items, ev, screen):
    base = [composite(u['scores'], PRESET[screen]) for u in items]
    bg = to_grades(base)
    PP = dict(P, SCREEN=PRESET[screen])
    p = build_profile(ev, NOW, PP)
    b = [boost_for(p, u, PP) for u in items]
    pers = personalize(base, b)
    pg = [g for _, g in pers]
    return base, bg, b, pg, order_pos(base, bg), order_pos([s for s, _ in pers], pg)


def view_metrics(P, scope):
    sample = None if scope == 'sigungu' else 4
    own = sib = oth = 0; own5 = sib5 = oth5 = 0; r1 = []; r5 = []
    for m in MONTHS:
        items = load(m, scope)
        for i in (range(len(items)) if sample is None else range(0, len(items), sample)):
            u = items[i]
            rel = {j for j, v in enumerate(items) if scope == 'dong' and v['sigungu']['id'] == u['sigungu']['id']} - {i}
            for n in (1, 5):
                _, bg, b, pg, _, _ = run_items(P, items, view_events(u, scope, n), 'quiet')
                ch = [j for j in range(len(items)) if pg[j] != bg[j]]
                o, s_, x = (i in ch), sum(j in rel for j in ch), sum(j != i and j not in rel for j in ch)
                if n == 1: own += o; sib += s_; oth += x; r1.append(b[i] / P['CAP'])
                else: own5 += o; sib5 += s_; oth5 += x; r5.append(b[i] / P['CAP'])
    t1, t5 = own + sib + oth, own5 + sib5 + oth5
    return dict(share1=own / max(1, t1), sib1=sib / max(1, t1), share5=own5 / max(1, t5), sib5=sib5 / max(1, t5),
                b1_max=max(r1), b1_med=st.median(r1), b5_med=st.median(r5), b5_min=min(r5))


def first_dong(items, sg):
    return next(u for u in items if u.get('sigungu', {}).get('id') == sg)


def aged(P, scope):
    out = {}
    lively_now = dict(kind='search', target=None, at=NOW, payload=dict(q='', preset='lively', terrain=[], month=None))
    ratios = {'quiet': [], 'lively': []}; unv = {'quiet': 0, 'lively': 0}
    for m in MONTHS:
        items = load(m, scope)
        is_old = lambda u: u['id'] in ('51820', '51830') or (u.get('sigungu') and u['sigungu']['id'] in ('51820', '51830'))
        for screen in ('quiet', 'lively'):
            _, bg, b, pg, _, _ = run_items(P, items, w4(30) + [lively_now], screen)
            old = st.mean(b[j] for j, u in enumerate(items) if is_old(u))
            top3 = sorted(range(len(items)), key=lambda j: -composite(items[j]['scores'], L))[:3]
            new = st.mean(b[j] for j in top3)
            ratios[screen].append(old / new if new else float('inf'))
            unv[screen] += sum(pg[j] != bg[j] for j, u in enumerate(items) if not is_old(u) and j not in top3)
            if m == '2025-10':
                out[f'2a_{screen}_10월'] = dict(old=old, top3=[round(b[j], 2) for j in top3], top3_names=[items[j]['name'] for j in top3])
    out['2a_ratio'] = {k: (min(v), st.median(v), max(v)) for k, v in ratios.items()}
    out['2a_unviewed_changes_6m'] = unv
    # (2b)(2c) 2025-10
    items = load('2025-10', scope)
    if scope == 'sigungu':
        tgt, newt = SG_ITEM(items, '51820'), SG_ITEM(items, '51150')
        mk = lambda u, a: rview(u['id'], a) if False else dict(kind='region_view', target=u['id'], at=NOW - a * DAY,
                                                              payload=dict(sigunguId=None, snapshot=dict(month='x', scores=u['scores'], terrain=u['terrain'])))
    else:
        tgt, newt = first_dong(items, '51820'), first_dong(items, '51150')
        mk = lambda u, a: dict(kind='dong_view', target=u['id'], at=NOW - a * DAY,
                               payload=dict(sigunguId=u['sigungu']['id'], snapshot=dict(month='x', scores=u['scores'], terrain=u['terrain'])))
    idx = lambda u: next(j for j, v in enumerate(items) if v['id'] == u['id'])
    _, _, bw, _, _, _ = run_items(P, items, [mk(tgt, a) for a in (28, 21, 14, 7, 0)], 'quiet')
    _, _, bd, _, _, _ = run_items(P, items, [mk(tgt, a / 24) for a in range(5)], 'quiet')
    out['2b_weekly/burst'] = (bw[idx(tgt)], bd[idx(tgt)], bw[idx(tgt)] / bd[idx(tgt)])
    _, bg, bc, pg, _, _ = run_items(P, items, [mk(tgt, a) for a in (28, 21, 14, 7)] + [mk(newt, 0)], 'quiet')
    out['2c_old/new'] = (bc[idx(tgt)], bc[idx(newt)], [items[j]['name'] + f' {bg[j]}→{pg[j]}' for j in range(len(items)) if bg[j] != pg[j]][:6])
    return out


def SG_ITEM(items, sid):
    return next(u for u in items if u['id'] == sid)


def sec6(P, scope):
    """조용·바닷가 검색 + 고성·양양 조회. 순위 상승 = 기본 자리 - 개인 자리 (양수가 위로)"""
    res = {'coast_unviewed': [], 'noncoast': [], 'coastQtop_unviewed': [], 'rest': []}
    for m in MONTHS:
        items = load(m, scope)
        base, bg, b, pg, p0, p1 = run_items(P, items, w4(0), 'quiet')
        qs = sorted(u['scores']['quiet'] for u in items); qmed = qs[len(qs) // 2]
        for j, u in enumerate(items):
            viewed = u['id'] in ('51820', '51830') or (u.get('sigungu') and u['sigungu']['id'] in ('51820', '51830'))
            if viewed: continue
            g = p0[j] - p1[j]
            coast = 'coast' in u['terrain']
            (res['coast_unviewed'] if coast else res['noncoast']).append(g)
            (res['coastQtop_unviewed'] if coast and u['scores']['quiet'] >= qmed else res['rest']).append(g)
    return {k: st.mean(v) for k, v in res.items()}


if __name__ == '__main__':
    scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
    out = {}
    for name, P in CAND.items():
        vm, ag, s6 = view_metrics(P, scope), aged(P, scope), sec6(P, scope)
        out[name] = dict(view=vm, aged=ag, sec6=s6)
        r = ag['2a_ratio']
        crit = dict(가=vm['share1'] >= .7 and vm['share5'] >= .7, 나=vm['b1_max'] <= .35, 다=vm['b5_med'] >= .8,
                    라=r['quiet'][2] < 1 and r['lively'][2] < 1, 육절=s6['coast_unviewed'] > 0 and s6['coast_unviewed'] > s6['noncoast'])
        out[name]['crit'] = crit
        print(f"\n## {name} [{scope}]")
        print(f"  (1) 본 지역 몫 1회 {vm['share1']:.0%} (형제 {vm['sib1']:.0%}) / 5회 {vm['share5']:.0%} (형제 {vm['sib5']:.0%})")
        print(f"  (2) 1회 자기가산/CAP 최대 {vm['b1_max']:.2f} 중앙 {vm['b1_med']:.2f} / 5회 중앙 {vm['b5_med']:.2f} 최소 {vm['b5_min']:.2f}")
        print(f"  (2a) 옛/새 비율 6개월 (최소,중앙,최대) 화면quiet {tuple(round(x, 2) for x in r['quiet'])} 화면lively {tuple(round(x, 2) for x in r['lively'])} 안 본 지역 등급변화 {ag['2a_unviewed_changes_6m']}")
        for k in ('2a_quiet_10월', '2a_lively_10월'):
            print(f"       {k}: 옛 관심 {ag[k]['old']:.2f}, 활기 상위3 {list(zip(ag[k]['top3_names'], ag[k]['top3']))}")
        w = ag['2b_weekly/burst']; c = ag['2c_old/new']
        print(f"  (2b) 주1회 {w[0]:.2f} / 하루5건 {w[1]:.2f} = {w[2]:.2f}   (2c) 옛 {c[0]:.2f} vs 오늘 {c[1]:.2f} 등급변화 {c[2]}")
        print(f"  (6절) 순위상승 평균: 안 본 coast {s6['coast_unviewed']:+.2f} vs 비coast {s6['noncoast']:+.2f} | coast∧quiet상위절반 {s6['coastQtop_unviewed']:+.2f} vs 그 밖 {s6['rest']:+.2f}")
        print('  판정 ' + ' '.join(f"{k}:{'O' if v else 'X'}" for k, v in crit.items()), flush=True)
    json.dump(out, open(f'result_round2_{scope}.json', 'w'), ensure_ascii=False, indent=1)
