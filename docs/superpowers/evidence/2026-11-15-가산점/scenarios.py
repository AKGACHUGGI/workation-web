"""시나리오 정의. now 는 고정 시각, 조회 스냅숏은 2025-10 시군구 실데이터에서 가져온다."""
from boost import load, DAY

NOW = 1_763_000_000_000  # 고정 시각 (ms)
SG = {i['id']: i for i in load('2025-10', 'sigungu')}
DONG = load('2025-10', 'dong')


def search(preset, terrain, age=0.0):
    return dict(kind='search', target=None, at=NOW - age * DAY,
                payload=dict(q='', preset=preset, terrain=terrain, month=None))


def rview(sid, age=0.0):
    u = SG[sid]
    return dict(kind='region_view', target=sid, at=NOW - age * DAY,
                payload=dict(sigunguId=None, snapshot=dict(month='2025-10', scores=u['scores'], terrain=u['terrain'])))


def dview(d, age=0.0):
    return dict(kind='dong_view', target=d['id'], at=NOW - age * DAY,
                payload=dict(sigunguId=d['sigungu']['id'], snapshot=dict(month='2025-10', scores=d['scores'], terrain=d['terrain'])))


GOSUNG_DONG = next(d for d in DONG if d['sigungu']['id'] == '51820')


def w4(age=0.0):
    # 실제 W4: 검색(조용·바닷가) 1건 + 고성·양양 조회
    return [search('quiet', ['coast'], age), rview('51820', age), rview('51830', age)]


SCENARIOS = {
    'S0 기록없음': ([], set()),
    'S1 검색(조용·바다)': ([search('quiet', ['coast'])], set()),
    'S2 W4(검색+고성·양양)': (w4(), {'51820', '51830'}),
    'S3 조회1(고성)': ([rview('51820')], {'51820'}),
    'S4 조회5(고성)': ([rview('51820', a / 24) for a in range(5)], {'51820'}),
    'S5 검색(활기)': ([search('lively', [])], set()),
    'S6 W4 7일전': (w4(7), {'51820', '51830'}),
    'S7 W4 30일전': (w4(30), {'51820', '51830'}),
    'S8 동조회1(고성 소속)': ([dview(GOSUNG_DONG)], {'51820', GOSUNG_DONG['id']}),
}
