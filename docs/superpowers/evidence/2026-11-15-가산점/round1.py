"""반박 라운드 1: (2) 반감기 시나리오 (3) 개인 점수 100 초과"""
import statistics as st
from boost import *
from scenarios import NOW, w4, rview, SCENARIOS
from sweep import MONTHS
SG = load('2025-10', 'sigungu'); name = {u['id']: u['name'] for u in SG}

def srch(preset, age=0):
    return dict(kind='search', target=None, at=NOW - age * DAY, payload=dict(q='', preset=preset, terrain=[], month=None))

def grades_view(P, ev, screen):
    base = [composite(u['scores'], PRESET[screen]) for u in SG]; bg = to_grades(base)
    p = build_profile(ev, NOW, P); b = [boost_for(p, u, P) for u in SG]
    pg = [g for _, g in personalize(base, b)]
    return {u['id']: b[i] for i, u in enumerate(SG)}, [f"{SG[i]['name']} {bg[i]}→{pg[i]}" for i in range(12) if bg[i] != pg[i]]

HLS = [(7, 60), (14, 60), (21, 90)]
for mixname, mix in [('현재 .5/.2/.3', (.5, .2, .3)), ('.2/.1/.7', (.2, .1, .7))]:
    print(f'\n==== MIX {mixname} ====')
    print('(2a) 30일 전 W4 + 오늘 활기 검색 1건, 화면 lively 2025-10 시군구')
    top = max(SG, key=lambda u: composite(u['scores'], PRESET['lively']))
    for hl, ma in HLS:
        P = dict(DEFAULT, MIX=mix, HL=hl, MAX_AGE=ma)
        b, ch = grades_view(P, w4(30) + [srch('lively')], 'lively')
        old = (b['51820'] + b['51830']) / 2
        print(f'  HL{hl:2d}/MAX{ma}: 옛 관심(고성·양양 평균)={old:.2f} 활기1위 {top["name"]}={b[top["id"]]:.2f} 옛/새={old / b[top["id"]]:.2f} 등급변화={ch}')
    print('(2b) 4주 동안 고성 주 1회(28·21·14·7·0일 전 5건) vs 오늘 1건, 화면 quiet')
    for hl, ma in HLS:
        P = dict(DEFAULT, MIX=mix, HL=hl, MAX_AGE=ma)
        b5, ch5 = grades_view(P, [rview('51820', a) for a in [28, 21, 14, 7, 0]], 'quiet')
        b1, _ = grades_view(P, [rview('51820')], 'quiet')
        bx, _ = grades_view(P, [rview('51820', a) for a in range(5)], 'quiet')
        print(f'  HL{hl:2d}: 주1회 5건 고성={b5["51820"]:.2f} (오늘 1건 {b1["51820"]:.2f}, 하루에 5건 {bx["51820"]:.2f}) 주1회/하루5건={b5["51820"] / bx["51820"]:.2f}')
    print('(2c) 관심 이동: 4주 전~1주 전 고성 주 1회(28·21·14·7일 전 4건) + 오늘 강릉 1건, 화면 quiet')
    for hl, ma in HLS:
        P = dict(DEFAULT, MIX=mix, HL=hl, MAX_AGE=ma)
        b, ch = grades_view(P, [rview('51820', a) for a in [28, 21, 14, 7]] + [rview('51150')], 'quiet')
        print(f'  HL{hl:2d}: 고성(옛)={b["51820"]:.2f} 강릉(오늘)={b["51150"]:.2f} 등급변화={ch}')

print('\n(3) 개인 점수(base+가산, personalize 후) 100 초과: 6개 달 × 2범위 × 시나리오 × 프리셋 quiet/lively')
for capname, P in [('CAP15', DEFAULT), ('CAP20', dict(DEFAULT, CAP=20))]:
    for s in ['sigungu', 'dong']:
        cnt = tot = 0; mx = 0; maxbase = 0; mxcase = None
        for m in MONTHS:
            items = load(m, s)
            for pre in ['quiet', 'lively']:
                base = [composite(u['scores'], PRESET[pre]) for u in items]; maxbase = max(maxbase, max(base))
                for sc, (ev, _) in SCENARIOS.items():
                    p = build_profile(ev, NOW, P)
                    for (sc_, g), u in zip(personalize(base, [boost_for(p, u, P) for u in items]), items):
                        tot += 1
                        if sc_ > 100: cnt += 1
                        if sc_ > mx: mx, mxcase = sc_, (m, pre, sc, u['name'])
        print(f'  {capname} {s:7s}: 100 초과 {cnt}/{tot}, 최댓값 {mx:.2f} {mxcase}, 기본점수 최댓값 {maxbase:.2f}')
