#!/usr/bin/env python3
"""행정동 경계(shp) → 시군구별 단순화 GeoJSON (public/geo/{sggId}.json)

사용법:
  python scripts/gen-geo.py <경계 shp 또는 geojson> <출력 디렉터리> [--tolerance 20]

- 원본 경계(통계청 SGIS 또는 공공데이터포털)는 저장소에 넣지 않는다.
- 허용 오차 기본 20m (EPSG:5179 로 투영해 simplify 후 EPSG:4326 으로 되돌린다).
- 시군구당 파일 1개, properties 는 { id, name } 만 남긴다. 목표 ≤ 100KB.
- 입력 컬럼명(ADM_CD, ADM_NM 등)은 --id-col / --name-col 로 지정한다.
의존성: geopandas, shapely  (pip install geopandas shapely)
"""
import argparse
import json
from pathlib import Path

import geopandas as gpd

# W-02 SIGUNGU 12곳과 같은 목록 (src/mocks/sigungu.ts)
TARGET_SGG = ['51820', '51830', '51210', '51150', '51170', '52110', '52140', '52800', '46150', '46770', '50110', '50130']


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument('source')
    p.add_argument('out_dir')
    p.add_argument('--tolerance', type=float, default=20.0, help='단순화 허용 오차 (m)')
    p.add_argument('--id-col', default='ADM_CD')
    p.add_argument('--name-col', default='ADM_NM')
    args = p.parse_args()

    gdf = gpd.read_file(args.source)
    gdf = gdf.to_crs(epsg=5179)
    gdf['geometry'] = gdf.geometry.simplify(args.tolerance, preserve_topology=True)
    gdf = gdf.to_crs(epsg=4326)

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for sgg in TARGET_SGG:
        part = gdf[gdf[args.id_col].astype(str).str.startswith(sgg)]
        if part.empty:
            print(f'skip {sgg}: no features')
            continue
        fc = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {'id': str(row[args.id_col]), 'name': str(row[args.name_col])},
                    'geometry': json.loads(gpd.GeoSeries([row.geometry]).to_json())['features'][0]['geometry'],
                }
                for _, row in part.iterrows()
            ],
        }
        path = out / f'{sgg}.json'
        path.write_text(json.dumps(fc, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(f'{path} {path.stat().st_size // 1024}KB {len(fc["features"])} features')


if __name__ == '__main__':
    main()
