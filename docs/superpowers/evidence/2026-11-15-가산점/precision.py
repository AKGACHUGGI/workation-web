"""시군구: 한 지역을 n번 본 뒤 생긴 등급 변화 중 본 지역 몫, 본 지역이 이미 S 라 효과 없는 비율. 달별 표준편차."""
import statistics as st
from boost import *
from sweep import view_events, MONTHS
from scenarios import NOW
for name, mix in [('현재 .5/.2/.3', (0.5, 0.2, 0.3)), ('.3/.2/.5', (0.3, 0.2, 0.5)), ('.2/.1/.7', (0.2, 0.1, 0.7))]:
    P = dict(DEFAULT, MIX=mix)
    for n in [1, 5]:
        own = oth = 0; s_only = cases = 0
        for m in MONTHS:
            items = load(m, 'sigungu'); base = [composite(u['scores'], PRESET['quiet']) for u in items]; bg = to_grades(base)
            for i, u in enumerate(items):
                pg = [g for _, g in personalize(base, [boost_for(build_profile(view_events(u, 'sigungu', n), NOW, P), v, P) for v in items])]
                ch = [j for j in range(12) if pg[j] != bg[j]]
                own += i in ch; oth += len([j for j in ch if j != i]); cases += 1
                s_only += bg[i] == 'S'
        print(f'{name} 조회{n}: 등급변화 총 {own+oth}건 중 본 지역 {own}건({own/max(1,own+oth):.0%}), 안 본 지역 {oth}건 / 본 지역이 이미 S 라 오를 수 없는 경우 {s_only}/{cases}')
print('달별 기본점수(quiet) 표준편차: 시군구 / 행정동')
for m in MONTHS:
    print(' ', m, *[f"{st.pstdev([composite(u['scores'], PRESET['quiet']) for u in load(m, s)]):.1f}" for s in ['sigungu', 'dong']])
