# 가산점 실측 자료

`../../specs/2026-11-15-개인화-랭킹-가산점-근거.md` 의 수치를 만든 스크립트·결과·데이터다.
읽기 전용 시뮬레이션이고, 서버에 아무것도 쓰지 않는다.

## 구성

- `boost.py`: `src/features/interest/profile.ts` · `personalize.ts` 와 `metric/score.ts` 를 Python 으로 옮긴 재현.
  옵션 기본값은 처음 구현과 같고, 원본 TS 와 36개 케이스를 대조해 가산점 차이 0, 등급 불일치 0 을 확인했다.
  대안 옵션: `MIX`, `CAP`, `HL`, `HL_PLACE`, `MAX_AGE`, `METRIC='diff'`(차이형), `BRANCH_SHARE`(갈래 몫), `PLACE_SAT`,
  `TERR_EMPTY`, `SHARE_BOOST`.
- `scenarios.py`: 시나리오(검색, W4 조회, 같은 곳 반복 조회, 오래된 기록 등).
- 판정 스크립트
  - `round3.py`, `round3b.py`, `round3c.py`: 근거 문서 5·6절의 수용 기준 판정. 최종 비교는 `round3c.py`.
  - `round1.py`: 반감기 비교, 프리셋 모드 100점 초과.
  - `round2.py`, `decomp_2a.py`: 옛 관심이 되살아나는 원인 분해.
  - `sweep.py`, `sweep2.py`: 상한·비중·대안 스윕.
  - `check_a.py`: 등급 한 단계 제한 위반 검사.
  - `d3_custom.py`: 직접 설정 모드 100점 초과.
  - `measure.py`, `detail.py`, `precision.py`, `extra.py`, `sim*.py`, `att_split.py`: 조사 중간 측정.
- `result_*.json`: 각 스크립트 결과.
- `data/`: 2026-11-15 에 로컬 백엔드(실제 Supabase DB)의 `GET /api/tier?month=<달>&scope=<sigungu|dong>` 로 받은 응답.
  6개 달(2025-01·04·07·10·12, annual) × 시군구·행정동.

## 재현

이 폴더에서 실행한다(Python 3, 표준 라이브러리만 쓴다).

```bash
python3 round3c.py sigungu   # 최종 후보 비교 (시군구)
python3 round3c.py dong      # 최종 후보 비교 (행정동)
python3 round1.py            # 반감기 비교
python3 check_a.py           # 등급 한 단계 제한 확인
```

새 후보를 판정하려면 `round3c.py` 의 `CAND` 에 `boost.py` 옵션 조합을 넣는다. 데이터를 새로 받으려면 백엔드를 띄운 뒤
위 API 응답을 `data/tier_<달>_<scope>.json` 으로 저장한다.
