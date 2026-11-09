#!/usr/bin/env python3
"""W-09 탐색 mock 기반 자료 생성기.

사용법: python3 scripts/gen-explore-base.py
입력:   public/geo/sigungu.json, public/geo/{시군구코드}.json (12개)
출력:   src/mocks/explore/base.generated.ts

- 시군구: id·이름·도 id(코드 앞 2자리)·중심(labelLat/labelLng)
- 행정동: id·이름·시군구 id·중심(labelLat/labelLng = ST_PointOnSurface)·bbox([west, south, east, north], 소수 5자리)
- 태그·장소·등급은 여기서 만들지 않는다 (src/mocks/explore/table.ts 수작업)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEO = ROOT / 'public' / 'geo'
OUT = ROOT / 'src' / 'mocks' / 'explore' / 'base.generated.ts'

HEADER = """// 자동 생성 — python3 scripts/gen-explore-base.py. 직접 고치지 않는다 (원본: public/geo)
import type { BBox, ExploreSigungu, LatLng } from '@/features/explore/types'

export type DongBase = { id: string; name: string; sigunguId: string; center: LatLng; bbox: BBox }

"""


def points(coords):
    if isinstance(coords[0], (int, float)):
        yield coords
        return
    for c in coords:
        yield from points(c)


def bbox(geometry):
    pts = list(points(geometry['coordinates']))
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return [round(min(xs), 5), round(min(ys), 5), round(max(xs), 5), round(max(ys), 5)]


def main():
    sigungu = json.loads((GEO / 'sigungu.json').read_text(encoding='utf-8'))['features']
    sgg_rows, dong_rows = [], []
    for f in sorted(sigungu, key=lambda f: f['properties']['id']):
        p = f['properties']
        sgg_rows.append({
            'id': p['id'], 'name': p['name'], 'provinceId': p['id'][:2],
            'center': {'lat': p['labelLat'], 'lng': p['labelLng']},
        })
        dongs = json.loads((GEO / f"{p['id']}.json").read_text(encoding='utf-8'))['features']
        for d in dongs:
            q = d['properties']
            dong_rows.append({
                'id': q['id'], 'name': q['name'], 'sigunguId': p['id'],
                'center': {'lat': q['labelLat'], 'lng': q['labelLng']},
                'bbox': bbox(d['geometry']),
            })
    dong_rows.sort(key=lambda r: r['id'])
    body = (
        f"export const SIGUNGU_BASE: ExploreSigungu[] = {json.dumps(sgg_rows, ensure_ascii=False)}\n\n"
        f"export const DONG_BASE: DongBase[] = {json.dumps(dong_rows, ensure_ascii=False)}\n"
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(HEADER + body, encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)}: 시군구 {len(sgg_rows)} · 행정동 {len(dong_rows)}')


if __name__ == '__main__':
    main()
