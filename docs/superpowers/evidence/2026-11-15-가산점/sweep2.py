"""반박 라운드 1 대안 비교. sweep.py 와 같은 지표 + 달별 범위 + 형제 동 비율.
사용: python3 sweep2.py [sigungu|dong]"""
import sys, statistics as st, json
from boost import *
from measure import order_pos, next_gap
from sweep import view_events, cap_of, MONTHS
from scenarios import NOW

Q = PRESET['quiet']
D = DEFAULT
V = {
    '0 현재(.5/.2/.3 HL7 CAP15)': (dict(D), ('abs', 15)),
    'i .2/.1/.7 HL7': (dict(D, MIX=(.2, .1, .7)), ('abs', 15)),
    'ii .2/.1/.7 HL21 MAX90': (dict(D, MIX=(.2, .1, .7), HL=21, MAX_AGE=90), ('abs', 15)),
    'iii .2/.1/.7 HL14 MAX60': (dict(D, MIX=(.2, .1, .7), HL=14), ('abs', 15)),
    'iv A2 차이형 .4/.1/.5': (dict(D, MIX=(.4, .1, .5), METRIC='diff', SCREEN=Q), ('abs', 15)),
    'v A3 빈지형 0.5': (dict(D, TERR_EMPTY=0.5), ('abs', 15)),
    'vi A5 포화통일': (dict(D, PLACE_SAT=2.0), ('abs', 15)),
    'vii A6 시군구몫 1회': (dict(D, SHARE_BOOST=1.0), ('abs', 15)),
    'viii-a CAP=0.5sd': (dict(D), ('sd', 0.5)),
    'viii-b CAP12': (dict(D), ('abs', 12)),
    'C1 .2/.1/.7 +A2 차이형': (dict(D, MIX=(.2, .1, .7), METRIC='diff', SCREEN=Q), ('abs', 15)),
    'C2 .2/.1/.7 +A2 +A3 +A5': (dict(D, MIX=(.2, .1, .7), METRIC='diff', SCREEN=Q, TERR_EMPTY=.5, PLACE_SAT=2.0), ('abs', 15)),
    'C3 .2/.1/.7 CAP12': (dict(D, MIX=(.2, .1, .7)), ('abs', 12)),
}


def evaluate(P, cap_spec, scope, n, with_search=False, sample=None):
    own_up = cand = 0; collat = []; sib = []; per_m = []
    for m in MONTHS:
        items = load(m, scope); base = [composite(u['scores'], Q) for u in items]; bg = to_grades(base)
        PP = dict(P, CAP=cap_of(cap_spec, base, bg)); sd = st.pstdev(base)
        mo_up = mo_c = 0; mo_r = []
        for i in (range(len(items)) if sample is None else range(0, len(items), sample)):
            u = items[i]
            p = build_profile(view_events(u, scope, n, 0.0, with_search), NOW, PP)
            b = [boost_for(p, v, PP) for v in items]
            pg = [g for _, g in personalize(base, b)]
            rel = {i} | ({j for j, v in enumerate(items) if v['sigungu']['id'] == u['sigungu']['id']} if scope == 'dong' else set())
            if bg[i] != 'S':
                cand += 1; own_up += pg[i] != bg[i]; mo_c += 1; mo_up += pg[i] != bg[i]
            collat.append(sum(pg[j] != bg[j] for j in range(len(items)) if j not in rel))
            if scope == 'dong' and len(rel) > 1 and b[i] > 0:
                sib.append(st.mean(b[j] for j in rel if j != i) / b[i])
            mo_r.append(max(b) / sd)
        per_m.append((m, mo_up / max(1, mo_c), st.median(mo_r)))
    return dict(own=own_up / cand, collat=st.mean(collat), collat_any=sum(c > 0 for c in collat) / len(collat),
                sib=st.mean(sib) if sib else None,
                up_rng=(min(x[1] for x in per_m), max(x[1] for x in per_m)),
                sd_rng=(min(x[2] for x in per_m), max(x[2] for x in per_m)))


if __name__ == '__main__':
    scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
    sample = None if scope == 'sigungu' else 4
    out = {}
    print('변형 | 1회: 자기↑율 무관변화(평균/발생) [달별 자기↑율 범위] | 1회+검색: 자기↑ 무관 | 5회: 자기↑ 무관 max/sd[달별범위]' + (' | 형제동/자기 가산비(1회)' if scope == 'dong' else ''))
    for name, (P, cap) in V.items():
        r1 = evaluate(P, cap, scope, 1, sample=sample)
        rs = evaluate(P, cap, scope, 1, True, sample=sample)
        r5 = evaluate(P, cap, scope, 5, sample=sample)
        out[name] = dict(v1=r1, v1s=rs, v5=r5)
        line = (f"{name:26s} | {r1['own']:.2f} {r1['collat']:.2f}/{r1['collat_any']:.2f} [{r1['up_rng'][0]:.2f}~{r1['up_rng'][1]:.2f}] "
                f"| {rs['own']:.2f} {rs['collat']:.2f} | {r5['own']:.2f} {r5['collat']:.2f} {r5['sd_rng'][0]:.2f}~{r5['sd_rng'][1]:.2f}")
        if scope == 'dong': line += f" | {r1['sib']:.2f}"
        print(line, flush=True)
    json.dump(out, open(f'result_sweep2_{scope}.json', 'w'), ensure_ascii=False, indent=1)
