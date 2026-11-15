"""(a) 등급 하락 없음·최대 한 단계 상승을 6개 달 × 2범위 × 시나리오 × 상한 5~40 에서 확인"""
from boost import *
from measure import MONTHS
from scenarios import SCENARIOS, NOW
bad = tot = jumps = 0
for m in MONTHS:
    for s in ['sigungu', 'dong']:
        items = load(m, s); base = [composite(u['scores'], PRESET['quiet']) for u in items]; bg = to_grades(base)
        for cap in [5, 15, 40]:
            P = dict(DEFAULT, CAP=cap)
            for ev, _ in SCENARIOS.values():
                p = build_profile(ev, NOW, P); pers = personalize(base, [boost_for(p, u, P) for u in items])
                raw = to_grades([b + boost_for(p, u, P) for b, u in zip(base, items)])
                for i, (_, g) in enumerate(pers):
                    d = GRADES.index(bg[i]) - GRADES.index(g); tot += 1
                    bad += d < 0 or d > 1
                    jumps += GRADES.index(bg[i]) - GRADES.index(raw[i]) >= 2 or GRADES.index(raw[i]) > GRADES.index(bg[i])
print(f'항목 {tot} 건 중 위반 {bad} 건, 제한이 없었다면 2단계 이상 상승 또는 하락이 났을 항목 {jumps} 건')
