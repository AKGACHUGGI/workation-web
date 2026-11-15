"""모든 지역을 하나씩 '본' 경우를 값 조합별로 측정 (6개 달 × 기준 프리셋 quiet).
본 지역 자신이 오르는지(c), 안 본 지역까지 등급이 바뀌는지(d), 한 번 본 가산점/상한(b), 가산점/표준편차·경계간격(e).
사용: python3 sweep.py [sigungu|dong]"""
import sys, statistics as st, json
from boost import *
from measure import order_pos, next_gap
from scenarios import NOW
from boost import DAY

MONTHS = ['2025-10', '2025-01', '2025-04', '2025-07', '2025-12', 'annual']


def view_events(u, scope, n, age=0.0, with_search=False):
    kind = 'region_view' if scope == 'sigungu' else 'dong_view'
    ev = [dict(kind=kind, target=u['id'], at=NOW - (age + k / 24) * DAY,
               payload=dict(sigunguId=u['sigungu']['id'] if scope == 'dong' else None,
                            snapshot=dict(month='x', scores=u['scores'], terrain=u['terrain'])))
          for k in range(n)]
    if with_search:
        ev.append(dict(kind='search', target=None, at=NOW - age * DAY,
                       payload=dict(q='', preset='quiet', terrain=['coast'], month=None)))
    return ev


def cap_of(spec, base, bg):
    kind, k = spec
    if kind == 'abs': return k
    if kind == 'sd': return k * st.pstdev(base)
    if kind == 'gap': return k * st.median(next_gap(base, bg))


def evaluate(P, cap_spec, scope, n_views, age=0.0, with_search=False, sample=None):
    rows = dict(own_up=0, own_cand=0, own_gain=[], collat=[], b1cap=[], own_b=[], other_max=[], ratio_sd=[], ratio_gap=[])
    for month in MONTHS:
        items = load(month, scope)
        base = [composite(u['scores'], PRESET['quiet']) for u in items]
        bg = to_grades(base)
        Q = dict(P, CAP=cap_of(cap_spec, base, bg))
        pos0 = order_pos(base, bg)
        sd = st.pstdev(base); gap = st.median(next_gap(base, bg))
        idxs = range(len(items)) if sample is None else range(0, len(items), sample)
        for i in idxs:
            u = items[i]
            p = build_profile(view_events(u, scope, n_views, age, with_search), NOW, Q)
            b = [boost_for(p, v, Q) for v in items]
            pers = personalize(base, b)
            pg = [g for _, g in pers]
            pos1 = order_pos([s for s, _ in pers], pg)
            related = {i} | ({j for j, v in enumerate(items) if v.get('sigungu') and v['sigungu']['id'] == u['sigungu']['id']} if scope == 'dong' else set())
            if bg[i] != 'S':
                rows['own_cand'] += 1
                rows['own_up'] += pg[i] != bg[i]
            rows['own_gain'].append(pos0[i] - pos1[i])
            rows['collat'].append(sum(pg[j] != bg[j] for j in range(len(items)) if j not in related))
            rows['own_b'].append(b[i])
            rows['other_max'].append(max(b[j] for j in range(len(items)) if j not in related))
            rows['b1cap'].append(b[i] / Q['CAP'] if Q['CAP'] else 0)
            rows['ratio_sd'].append(max(b) / sd)
            rows['ratio_gap'].append((max(b) - min(b)) / gap if gap else 0)
    return dict(own_up_rate=rows['own_up'] / max(1, rows['own_cand']),
                own_gain_med=st.median(rows['own_gain']), own_gain_mean=st.mean(rows['own_gain']),
                collat_mean=st.mean(rows['collat']), collat_any=sum(c > 0 for c in rows['collat']) / len(rows['collat']),
                own_b_med=st.median(rows['own_b']), other_max_med=st.median(rows['other_max']),
                own_b_over_cap_max=max(rows['b1cap']),
                maxb_over_sd_med=st.median(rows['ratio_sd']), spread_over_gap_med=st.median(rows['ratio_gap']))


VARIANTS = {
    '현재 CAP15 MIX.5/.2/.3': (dict(DEFAULT), ('abs', 15)),
    'CAP5': (dict(DEFAULT), ('abs', 5)),
    'CAP10': (dict(DEFAULT), ('abs', 10)),
    'CAP20': (dict(DEFAULT), ('abs', 20)),
    'CAP=0.5sd': (dict(DEFAULT), ('sd', 0.5)),
    'CAP=1.0sd': (dict(DEFAULT), ('sd', 1.0)),
    'CAP=1.5gap': (dict(DEFAULT), ('gap', 1.5)),
    'CAP=2gap': (dict(DEFAULT), ('gap', 2.0)),
    'MIX.3/.2/.5': (dict(DEFAULT, MIX=(0.3, 0.2, 0.5)), ('abs', 15)),
    'MIX.2/.1/.7': (dict(DEFAULT, MIX=(0.2, 0.1, 0.7)), ('abs', 15)),
    'MIX0/0/1': (dict(DEFAULT, MIX=(0.0, 0.0, 1.0)), ('abs', 15)),
    'MIX.5/0/.5': (dict(DEFAULT, MIX=(0.5, 0.0, 0.5)), ('abs', 15)),
}

if __name__ == '__main__':
    scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
    sample = None if scope == 'sigungu' else 4
    out = {}
    for name, (P, cap) in VARIANTS.items():
        for nv, ws in [(1, False), (1, True), (5, False)]:
            r = evaluate(P, cap, scope, nv, with_search=ws, sample=sample)
            tag = f'{name} | 조회{nv}{"+검색" if ws else ""}'
            out[tag] = r
            print(f"{tag:34s} 자기등급↑율={r['own_up_rate']:.2f} 자기순위상승(중앙/평균)={r['own_gain_med']:.0f}/{r['own_gain_mean']:.1f} "
                  f"무관등급변화(평균/발생률)={r['collat_mean']:.2f}/{r['collat_any']:.2f} 자기가산(중앙)={r['own_b_med']:.2f} 무관최대가산(중앙)={r['other_max_med']:.2f} "
                  f"자기/CAP최대={r['own_b_over_cap_max']:.2f} max/sd={r['maxb_over_sd_med']:.2f} spread/gap={r['spread_over_gap_med']:.2f}", flush=True)
    json.dump(out, open(f'result_sweep_{scope}.json', 'w'), ensure_ascii=False, indent=1)
