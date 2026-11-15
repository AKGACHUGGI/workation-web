"""interest/profile.ts · personalize.ts · metric/score.ts 를 그대로 옮긴 재현 (읽기 전용 시뮬레이션)."""
import json, math, os

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
KEYS = ['quiet', 'crowd', 'peer', 'overnight', 'vibe']
GRADES = ['S', 'A', 'B', 'C']
TERRAINS = ['coast', 'mountain', 'city']
PRESET = {
    'quiet': {'quiet': 3, 'crowd': 3, 'peer': 1, 'overnight': 1, 'vibe': 0},
    'lively': {'quiet': 0, 'crowd': 1, 'peer': 3, 'overnight': 2, 'vibe': 3},
}
DAY = 86_400_000

DEFAULT = dict(CAP=15, MIX=(0.5, 0.2, 0.3), VIEW=0.5, SHARE=0.5, HL=7, SAT=2.0,
               MAX_AGE=60, METRIC='abs', SCREEN=None, TERR_EMPTY=0.0, PLACE_SAT=1.0, SHARE_BOOST=None,
               HL_PLACE=None, METRIC_SCALE=1.0, BRANCH_SHARE=False)
#  BRANCH_SHARE: 지형 일치도를 tMax 대신 strength 로 나누고(관심 중 그 지형 몫), 지표 일치도에 msum/strength 를 곱한다.
#               오늘 다른 기록이 strength 를 키워 옛 지형·지표 관심을 되살리는 것을 막는 runner 안
#  HL_PLACE: place 갈래만 다른 반감기 (attacker 안 A). None 이면 HL
#  METRIC_SCALE: 차이형 metricMatch 에 곱하는 배수 (attacker 안 B 는 2, 1 을 넘으면 1 로 자름)
# 대안 옵션 (기본값은 원본과 같음)
#  MAX_AGE: 이 일수보다 오래된 기록 제외 (store.ts readEvents)
#  METRIC='diff': metricMatch = max(0, composite(u, profile) - composite(u, SCREEN)) / 100  (A2)
#  TERR_EMPTY: 프로필 지형이 있을 때 terrain 이 빈 지역의 지형 일치도 (A3)
#  PLACE_SAT: placeMatch = 1 - exp(-pw / PLACE_SAT). 2.0 이면 s 와 같은 포화 (A5)
#  SHARE_BOOST: boostFor 에서 소속 시군구 관심에 곱하는 값. None 이면 SHARE (A6 는 1.0)


def load(month, scope):
    return json.load(open(os.path.join(DATA, f'tier_{month}_{scope}.json')))['items']


def composite(scores, w):
    s = t = 0
    for k in KEYS:
        s += scores[k] * w[k]
        t += w[k]
    return 0 if t == 0 else s / t


def to_grades(values):
    n = len(values)
    srt = sorted(values, reverse=True)
    out = []
    for v in values:
        rank = srt.index(v) + 1
        r = (rank - 1) / n
        out.append('S' if r < 0.25 else 'A' if r < 0.5 else 'B' if r < 0.75 else 'C')
    return out


def build_profile(events, now, P):
    metric = {k: 0.0 for k in KEYS}
    terrain = {t: 0.0 for t in TERRAINS}
    place = {}
    strength = 0.0

    def add_norm(v, w):
        sm = sum(v[k] for k in KEYS)
        if sm <= 0:
            return
        for k in KEYS:
            metric[k] += v[k] / sm * w

    for e in events:
        if now - e['at'] > P['MAX_AGE'] * DAY:
            continue
        w = 0.5 ** ((now - e['at']) / (P['HL'] * DAY))
        wp = 0.5 ** ((now - e['at']) / ((P['HL_PLACE'] or P['HL']) * DAY))
        strength += w
        if e['kind'] == 'search':
            pr = e['payload']['preset']
            if pr in ('quiet', 'lively'):
                add_norm(PRESET[pr], w)
            for t in e['payload']['terrain']:
                terrain[t] += w
            continue
        place[e['target']] = place.get(e['target'], 0) + wp
        sg = e['payload'].get('sigunguId')
        if e['kind'] == 'dong_view' and sg:
            place[sg] = place.get(sg, 0) + wp * P['SHARE']
        snap = e['payload'].get('snapshot')
        if snap:
            add_norm({k: max(0, snap['scores'][k] - 50) / 50 for k in KEYS}, w * P['VIEW'])
            for t in snap['terrain']:
                terrain[t] += w * P['VIEW']
    return dict(metric=metric, terrain=terrain, place=place, strength=strength)


def boost_for(p, u, P):
    if p['strength'] == 0:
        return 0.0
    s = 1 - math.exp(-p['strength'] / P['SAT'])
    msum = sum(p['metric'].values())
    mm = composite(u['scores'], p['metric']) / 100 if msum > 0 else 0
    if P['METRIC'] == 'diff' and msum > 0:
        mm = min(1.0, P['METRIC_SCALE'] * max(0.0, mm - composite(u['scores'], P['SCREEN']) / 100))
    if P['BRANCH_SHARE']:
        mm *= min(1.0, msum / p['strength'])
    tmax = max(p['terrain'].values())
    if P['BRANCH_SHARE'] and tmax > 0 and u.get('terrain'):
        tm = min(1.0, max(p['terrain'][t] for t in u['terrain']) / p['strength'])
    elif tmax > 0 and u.get('terrain'):
        tm = max(p['terrain'][t] / tmax for t in u['terrain'])
    else:
        tm = P['TERR_EMPTY'] if tmax > 0 else 0
    sg = u.get('sigungu', {}).get('id') if u.get('sigungu') else None
    sb = P['SHARE'] if P['SHARE_BOOST'] is None else P['SHARE_BOOST']
    pw = p['place'].get(u['id'], 0) + (p['place'].get(sg, 0) * sb if sg else 0)
    pm = 1 - math.exp(-pw / P['PLACE_SAT'])
    a, b, c = P['MIX']
    return P['CAP'] * (a * s * mm + b * s * tm + c * pm)


def personalize(base, boost):
    personal = [b + x for b, x in zip(base, boost)]
    bg, pg = to_grades(base), to_grades(personal)
    gi = []
    for i in range(len(base)):
        b, p = GRADES.index(bg[i]), GRADES.index(pg[i])
        gi.append(min(b, max(b - 1, p)))
    minat = [math.inf] * 4
    for i, s in enumerate(personal):
        minat[gi[i]] = min(minat[gi[i]], s)
    ceil = [min([math.inf] + minat[:g]) for g in range(4)]
    return [(min(s, ceil[gi[i]]), GRADES[gi[i]]) for i, s in enumerate(personal)]
