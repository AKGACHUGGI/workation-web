# 지도 경계 (GeoJSON)

지도 히트맵(W-01 · W-04)에 칠할 시군구 · 행정동 경계입니다. 점수는 백엔드 `GET /api/v1/map/scores` 로 받고, 각 Feature 의 `id` 와 응답 `items[].id` 를 맞춰 색을 칠합니다.

| 파일 | 개수 | `id` | properties | 크기 |
| --- | --- | --- | --- | --- |
| `regions.geojson` | 시군구 12 | 시군구 코드 5자리 (예 `51820` 고성군) | `name`, `sidoName` | 약 110 KB |
| `dongs.geojson` | 행정동 204 | 행정동 코드 10자리 (예 `5115066500` 경포동) | `name`, `regionId`, `regionName`, `noData` | 약 420 KB |

- 출처: 행정동 경계 [vuski/admdongkor](https://github.com/vuski/admdongkor) ver20251231. Supabase `dong.geom`(PostGIS)에서 뽑았습니다.
- 단순화: 행정동 0.0002° (약 20 m), 시군구 0.0005° (약 50 m). 좌표는 소수 5자리.
- `noData: true` 인 행정동(전주시 송천3동)은 경계 자료에는 있지만 LG U+ 데이터에는 없어 지표가 없습니다. 회색 "데이터 없음" 으로 칠합니다.
- 고성군 수동면은 경계 자료가 없어 파일에 없습니다 (집계 제외 행정동).
- 시군구 외곽선은 행정동을 합친 뒤 내부 구멍을 메웠습니다.
- 다시 만들 때: workation-backend `db/` 의 경계 SQL 기준으로 `ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.0002), 5)`.

## 쓰는 법 (Google Maps)

```ts
map.data.loadGeoJson('/geo/dongs.geojson', { idPropertyName: 'id' })
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/map/scores?level=dong&metric=quiet&month=10`)
const scores = new Map((await res.json()).items.map((i) => [i.id, i]))
map.data.setStyle((f) => {
  const item = scores.get(f.getId() as string)
  return { fillColor: f.getProperty('noData') ? '#bdbdbd' : colorOf(item?.score), strokeWeight: 0.5 }
})
```
