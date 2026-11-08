# 지도 경계 (GeoJSON)

지도 히트맵(W-01 · W-04)에 칠할 시군구 · 행정동 경계입니다. 점수는 백엔드 `GET /api/v1/map/scores` 로 받고, 각 Feature 의 `id` 와 응답 `items[].id` 를 맞춰 색을 칠합니다.

| 파일 | 개수 | `id` | properties | 크기 |
| --- | --- | --- | --- | --- |
| `regions.geojson` | 시군구 12 | 시군구 코드 5자리 (예 `51820` 고성군) | `name`, `sidoName`, `labelLat`, `labelLng` | 약 110 KB |
| `dongs.geojson` | 행정동 204 | 행정동 코드 10자리 (예 `5115066500` 경포동) | `name`, `regionId`, `regionName`, `noData`, `labelLat`, `labelLng` | 약 420 KB |

- 출처: 행정동 경계 [vuski/admdongkor](https://github.com/vuski/admdongkor) ver20251231. Supabase `dong.geom`(PostGIS)에서 뽑았습니다.
- 단순화: 행정동 0.0002° (약 20 m), 시군구 0.0005° (약 50 m). 좌표는 소수 5자리.
- `noData: true` 인 행정동(전주시 송천3동)은 경계 자료에는 있지만 LG U+ 데이터에는 없어 지표가 없습니다. 회색 "데이터 없음" 으로 칠합니다.
- 고성군 수동면은 경계 자료가 없어 파일에 없습니다 (집계 제외 행정동).
- 시군구 외곽선은 행정동을 합친 뒤 내부 구멍을 메웠습니다.
- `labelLat` · `labelLng`: 구역 안쪽 대표 점(PostGIS `ST_PointOnSurface`, 섬이 여럿이면 가장 큰 조각). 이름 · 점수 · 등급 라벨을 여기에 놓으면 오목한 구역이나 섬에서도 라벨이 구역 밖으로 나가지 않습니다. 송천3동은 DB 에 없어 경계 점 평균입니다.
- 다시 만들 때: workation-backend `db/` 의 경계 SQL 기준으로 `ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.0002), 5)`.

## 라벨 (구역 안에 이름 · 점수 · 등급)

- `google.maps.OverlayView` 로 `labelLat/labelLng` 위치에 div 를 띄우고 `floatPane` 에 넣으면 색칠한 구역 위에 선명하게 보입니다.
- 라벨이 겹치면 큰 구역부터 자리를 잡고 겹치는 작은 구역 라벨은 숨깁니다. 지도 `idle` 때마다 다시 계산하면 확대할수록 더 많이 보입니다.
- 등급(배지)은 전국 기준 사분위, 시군구 안을 볼 때의 색은 그 시군구 최저~최고 점수로 다시 칠하면 군 안 차이가 보입니다.

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
