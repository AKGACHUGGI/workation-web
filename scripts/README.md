# scripts

## gen-mock.py — tier mock 생성 (W-02)

LG U+ 전처리 데이터와 분석 피처 CSV 로 `GET /api/tier` mock 26개(시군구·행정동 × 연간·12개월)를 만든다.
원본 CSV 는 저장소에 넣지 않는다(보관 위치는 공통 기반 스펙 §11 열린 항목, workation-data 저장소 후보).

```bash
python3 -m pip install pandas
python3 scripts/gen-mock.py <processed_dir> <feature_dir>
```

| 입력                                    | 필요한 컬럼                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `<feature_dir>/sgg_month_features.csv`  | `sgg_id, sgg_name, month(YYYY-MM), day_inflow, crowd, peer_share, evening_vibe, overnight_coef`              |
| `<feature_dir>/dong_month_features.csv` | `dong_id, dong_name, sgg_id, month, day_inflow, crowd_dong, peer_share, evening_vibe, special_facility(0/1)` |
| `<processed_dir>/dong_mask_ratio.csv`   | `dong_id, mask_ratio(0~1)`                                                                                   |

컬럼명이 다르면 스크립트 위쪽 `*_COLUMNS` 사전만 고친다.

- 출력: `src/mocks/tier/generated/{scope}-{month}.json`. `src/mocks/tier/index.ts` 가 `import.meta.glob` 으로 자동으로 읽는다.
- **10월(`2025-10`)은 항상 `sigungu-2025-10.ts`·`dong-2025-10.ts` 수작업 픽스처를 쓴다.** 테스트·E2E·다른 화면(W-03~W-08) 기대값이 이 값에 묶여 있다.
- 생성 파일이 없으면 `deriveMonth`(결정적 생성기)가 대신 응답한다. 개발·CI 는 생성 파일 없이 돈다.
- 백분위 규칙은 W-02 스펙 §5 와 같다(스크립트 docstring 참고). 백엔드 구현과 결과가 다르면 스펙을 기준으로 맞춘다.

## region (W-03)

`gen-mock.py` 에 `region` 서브커맨드를 추가해 `src/mocks/region/{sggId}-{month}.ts` 를 생성한다 (스펙 W-03 §5-2 산출 규칙: stats·months 는 특수시설 동 제외 합계, `peerOffpeakMonths` 는 또래 z − 혼잡 z 상위 2개월, `seasonType` 은 동 계절 NMF 평균 최대). 생성 전까지는 `src/mocks/region/generate.ts` 의 `makeRegionMock` 이 결정적 가짜 값을 돌려준다. `tags`·`landmark`·`links`·`photos` 는 `src/mocks/region/manual.ts` 에서 수동 관리.
