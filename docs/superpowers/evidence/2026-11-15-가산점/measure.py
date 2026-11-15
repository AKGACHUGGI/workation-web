"""시나리오 × 값 조합 측정. 사용: python3 measure.py [variant ...]  (인자 없으면 기본값만)"""
import json, statistics as st, sys
from boost import *
from scenarios import SCENARIOS, NOW

MONTHS = ['2025-10', '2025-01', '2025-04', '2025-07', '2025-12', 'annual']


def kendall(a, b):
    n = len(a); c = d = 0
    for i in range(n):
        for j in range(i + 1, n):
            x = (a[i] - a[j]) * (b[i] - b[j])
            c += x > 0; d += x < 0
    return (c - d) / (n * (n - 1) / 2)


def order_pos(scores, grades):
    idx = sorted(range(len(scores)), key=lambda i: (GRADES.index(grades[i]), -scores[i]))
    pos = [0] * len(scores)
    for r, i in enumerate(idx):
        pos[i] = r
    return pos


def next_gap(base, grades):
    """기본 등급 S 가 아닌 항목이 한 단계 위 등급 최저 점수까지 필요한 점수"""
    mins = {g: min(b for b, gg in zip(base, grades) if gg == g) for g in set(grades)}
    gaps = []
    for b, g in zip(base, grades):
        gi = GRADES.index(g)
        if gi == 0: continue
        up = GRADES[gi - 1]
        if up in mins: gaps.append(max(0.0, mins[up] - b))
    return gaps


def interested(u, ids):
    return u['id'] in ids or (u.get('sigungu') and u['sigungu']['id'] in ids)


def run(P, month, scope, scen, preset='quiet'):
    items = load(month, scope)
    events, ids = SCENARIOS[scen]
    p = build_profile(events, NOW, P)
    bst = [boost_for(p, u, P) for u in items]
    base = [composite(u['scores'], PRESET[preset]) for u in items]
    bg = to_grades(base)
    pers = personalize(base, bst)
    pg = [g for _, g in pers]
    ps = [s for s, _ in pers]
    tau = kendall(order_pos(base, bg), order_pos(ps, pg))
    pos0, pos1 = order_pos(base, bg), order_pos(ps, pg)
    moved = sum(a != b for a, b in zip(pos0, pos1))
    up = sum(a != b for a, b in zip(bg, pg))
    gaps = next_gap(base, bg)
    sd = st.pstdev(base)
    if not ids and scen.startswith('S1'):
        ids = {u['id'] for u in items if 'coast' in u['terrain']}
    ib = [x for u, x in zip(items, bst) if interested(u, ids)]
    nb = [x for u, x in zip(items, bst) if not interested(u, ids)]
    spread_non = (max(nb) - min(nb)) if nb else 0
    return dict(n=len(items), bmin=min(bst), bmed=st.median(bst), bmax=max(bst),
                spread=max(bst) - min(bst), up=up, moved=moved, tau=tau,
                int_mean=st.mean(ib) if ib else None, non_mean=st.mean(nb) if nb else None,
                non_spread=spread_non, sd=sd, gap_med=st.median(gaps) if gaps else 0,
                max_over_sd=max(bst) / sd, spread_over_sd=(max(bst) - min(bst)) / sd,
                spread_over_gap=(max(bst) - min(bst)) / st.median(gaps) if gaps and st.median(gaps) > 0 else None,
                cap_frac=max(bst) / P['CAP'] if P['CAP'] else 0)


def fmt(r):
    f = lambda v: '-' if v is None else f'{v:.2f}'
    return (f"n={r['n']:3d} boost min/med/max={f(r['bmin'])}/{f(r['bmed'])}/{f(r['bmax'])} "
            f"spread={f(r['spread'])} 등급↑={r['up']} 자리이동={r['moved']} tau={r['tau']:.3f} "
            f"관심평균={f(r['int_mean'])} 무관평균={f(r['non_mean'])} 무관spread={f(r['non_spread'])} "
            f"sd={r['sd']:.1f} gap중앙={r['gap_med']:.2f} max/sd={r['max_over_sd']:.2f} "
            f"spread/gap={f(r['spread_over_gap'])} max/CAP={r['cap_frac']:.2f}")


if __name__ == '__main__':
    out = []
    for scope in ['sigungu', 'dong']:
        for scen in SCENARIOS:
            pre = 'lively' if scen.startswith('S5') else 'quiet'
            r = run(DEFAULT, '2025-10', scope, scen, pre)
            out.append(dict(scope=scope, scen=scen, **r))
            print(scope, scen.ljust(22), fmt(r))
    json.dump(out, open('result_default_2025-10.json', 'w'), ensure_ascii=False, indent=1)
