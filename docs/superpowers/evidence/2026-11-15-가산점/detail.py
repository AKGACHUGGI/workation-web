"""시군구 한 시나리오의 항목별 표 + 가산점-기본점수 상관. 사용: python3 detail.py '<시나리오 접두>' [month]"""
import sys, statistics as st
from boost import *
from scenarios import SCENARIOS, NOW
key = next(k for k in SCENARIOS if k.startswith(sys.argv[1])); month = sys.argv[2] if len(sys.argv)>2 else '2025-10'
pre = 'lively' if key.startswith('S5') else 'quiet'
items = load(month,'sigungu'); p = build_profile(SCENARIOS[key][0], NOW, DEFAULT)
b = [boost_for(p,u,DEFAULT) for u in items]; base=[composite(u['scores'],PRESET[pre]) for u in items]
bg=to_grades(base); pers=personalize(base,b)
for i in sorted(range(len(items)), key=lambda i:-base[i]):
    print(f"{items[i]['name']:6s} {items[i]['id']} {'/'.join(items[i]['terrain']):12s} base={base[i]:6.2f} {bg[i]} boost={b[i]:5.2f} -> {pers[i][0]:6.2f} {pers[i][1]}")
print(key, month, 'corr(boost, base)=%.2f' % st.correlation(b, base))
