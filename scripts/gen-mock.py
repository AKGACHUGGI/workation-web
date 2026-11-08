#!/usr/bin/env python3
"""W-02 tier mock 생성기.

사용법: python scripts/gen-mock.py <processed_dir> <feature_dir>
출력:   src/mocks/tier/generated/{sigungu|dong}-{annual|2025-MM}.json (26개)

백분위 규칙은 W-02 스펙 §5 (백엔드 계약과 동일):
- 같은 month·scope 안의 모든 단위가 모집단, 0~100 정수
- quiet(day_inflow)·crowd 는 낮을수록 높은 점수, peer·vibe·overnight 는 높을수록
- overnight 는 시군구 숙박 계수의 12개월 평균(연중 상수). 행정동은 소속 시군구 값을 행정동 모집단에서 다시 백분위
- 마스킹 비율 30% 초과·특수시설 행정동은 제외 (모집단에서도 제외)
- annual 은 12개월 원천 값 평균으로 백분위
"""
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'mocks' / 'tier' / 'generated'
MONTHS = [f'2025-{m:02d}' for m in range(1, 13)]
METRICS = ['quiet', 'crowd', 'peer', 'vibe', 'overnight']
HIGHER_IS_BETTER = {'quiet': False, 'crowd': False, 'peer': True, 'vibe': True, 'overnight': True}

# 원본 CSV 컬럼 → 내부 이름. 컬럼명이 다르면 이 사전만 고친다.
SGG_COLUMNS = {
    'sgg_id': 'id', 'sgg_name': 'name', 'month': 'month',
    'day_inflow': 'quiet', 'crowd': 'crowd', 'peer_share': 'peer',
    'evening_vibe': 'vibe', 'overnight_coef': 'overnight',
}
DONG_COLUMNS = {
    'dong_id': 'id', 'dong_name': 'name', 'sgg_id': 'sgg', 'month': 'month',
    'day_inflow': 'quiet', 'crowd_dong': 'crowd', 'peer_share': 'peer',
    'evening_vibe': 'vibe', 'special_facility': 'special',
}
MASK_COLUMNS = {'dong_id': 'id', 'mask_ratio': 'mask_ratio'}


def percentile(values: pd.Series, higher_is_better: bool) -> pd.Series:
    """작은 값이 0, 큰 값이 100 (lower-is-better 면 반대). 동점은 같은 값."""
    n = len(values)
    if n < 2:
        return pd.Series([50] * n, index=values.index)
    rank = values.rank(method='min', ascending=higher_is_better)
    return ((rank - 1) / (n - 1) * 100).round().astype(int)


def pick(df: pd.DataFrame, month: str) -> pd.DataFrame:
    if month != 'annual':
        return df[df['month'] == month].copy()
    keys = ['id', 'name'] + (['sgg'] if 'sgg' in df.columns else [])
    return df.groupby(keys, as_index=False)[METRICS].mean()


def score_rows(df: pd.DataFrame, with_sgg: bool) -> list[dict]:
    df = df.reset_index(drop=True)
    scores = {k: percentile(df[k], HIGHER_IS_BETTER[k]) for k in METRICS}
    rows = []
    for i, r in df.iterrows():
        row = {'id': str(r['id']), 'name': str(r['name']), 'scores': {k: int(scores[k][i]) for k in METRICS}}
        if with_sgg:
            row['sggId'] = str(r['sgg'])
        rows.append(row)
    return rows


def write(scope: str, month: str, rows: list[dict]) -> None:
    path = OUT / f'{scope}-{month}.json'
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{path.relative_to(ROOT)}  {len(rows)}개')


def main(processed_dir: Path, feature_dir: Path) -> None:
    sgg = pd.read_csv(feature_dir / 'sgg_month_features.csv', dtype={'sgg_id': str}).rename(columns=SGG_COLUMNS)
    dong = pd.read_csv(feature_dir / 'dong_month_features.csv', dtype={'dong_id': str, 'sgg_id': str}).rename(
        columns=DONG_COLUMNS
    )
    mask = pd.read_csv(processed_dir / 'dong_mask_ratio.csv', dtype={'dong_id': str}).rename(columns=MASK_COLUMNS)

    overnight = sgg.groupby('id')['overnight'].mean()  # 연중 상수
    sgg['overnight'] = sgg['id'].map(overnight)

    dong = dong.merge(mask, on='id', how='left')
    dong = dong[(dong['mask_ratio'].fillna(0) <= 0.3) & (dong['special'].fillna(0) == 0)]
    dong['overnight'] = dong['sgg'].map(overnight)

    OUT.mkdir(parents=True, exist_ok=True)
    for month in ['annual', *MONTHS]:
        write('sigungu', month, score_rows(pick(sgg, month), with_sgg=False))
        write('dong', month, score_rows(pick(dong, month), with_sgg=True))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('usage: python scripts/gen-mock.py <processed_dir> <feature_dir>')
    main(Path(sys.argv[1]), Path(sys.argv[2]))
