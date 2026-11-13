/**
 * 동별 관광공사 태그 (핀 아이콘 mock). 숫자 = v5 장소 수, true = badge 태그. v6 는 키(태그 id)만 쓴다.
 * 표에 없는 동은 태그 없음([]).
 */
export const TAG_TABLE: Record<string, Record<string, number | true>> = {
  // 고성군
  '5182025000': { city: true, library: 1, market: 1, mountain: true }, // 간성읍
  '5182025300': { coast: true, cafe: 3, beach: 2 }, // 거진읍
  '5182031000': { coast: true, mountain: true }, // 현내면
  '5182032000': { coast: true, resort: 2, surf: 1 }, // 죽왕면
  '5182033000': { coast: true, resort: 3, long_stay: 1, beach: 2, mountain: true }, // 토성면
  // 속초시
  '5121051000': { cafe: 6, long_stay: 2, beach: 1, park: 1 }, // 영랑동
  '5121052000': { coast: true, city: true, long_stay: 1, market: 1 }, // 동명동
  '5121054000': { city: true, library: 1 }, // 금호동
  '5121056000': { city: true, cafe: 4, library: 1, park: 1 }, // 교동
  '5121057000': { resort: 2, mountain: true }, // 노학동
  '5121058000': { coast: true, city: true, cafe: 5, long_stay: 3, market: 1 }, // 조양동
  '5121059000': { coast: true, long_stay: 1 }, // 청호동
  '5121060000': { coast: true, resort: 1, mountain: true }, // 대포동
  // 양양군
  '5183025000': { cafe: 3, library: 1, market: 1 }, // 양양읍
  '5183031000': { mountain: true }, // 서면
  '5183032000': { coast: true, surf: 1 }, // 손양면
  '5183033000': { coast: true, long_stay: 2, mountain: true }, // 현북면
  '5183034000': { coast: true, long_stay: 2, beach: 2, surf: 3 }, // 현남면
  '5183035000': { coast: true, resort: 2, mountain: true }, // 강현면
  // 강릉시
  '5115025000': { coast: true, cafe: 7, long_stay: 8, beach: 3, market: 1 }, // 주문진읍
  '5115031000': { mountain: true }, // 성산면
  '5115032000': { resort: 1, mountain: true }, // 왕산면
  '5115035000': { coast: true, mountain: true }, // 옥계면
  '5115036000': { coast: true, long_stay: 2 }, // 사천면
  '5115037000': { coast: true, park: 1 }, // 연곡면
  '5115052000': { city: true, cafe: 4, library: 1, market: 2 }, // 중앙동
  '5115055000': { city: true, cafe: 3, library: 1 }, // 교1동
  '5115058000': { long_stay: 1, park: 1 }, // 초당동
  '5115059000': { coast: true, cafe: 9, long_stay: 3, beach: 2 }, // 송정동
  '5115066500': { coast: true, cafe: 11, long_stay: 4, resort: 2, beach: 2, park: 1 }, // 경포동
  // 동해시
  '5117051000': { city: true, cafe: 3, library: 1, market: 1 }, // 천곡동
  '5117059000': { coast: true, long_stay: 1, beach: 1, market: 1 }, // 묵호동
  '5117063000': { coast: true, long_stay: 2, resort: 1, surf: 1 }, // 망상동
  '5117065000': { mountain: true }, // 삼화동
  // 전북 (화면 밖 8)
  '5211151000': { city: true, cafe: 4 }, // 전주 중앙동
  '5211153000': { city: true, cafe: 5, market: 1 }, // 풍남동
  '5211168000': { cafe: 3 }, // 서신동
  '5211171400': { cafe: 3, library: 1 }, // 효자4동
  '5211357000': { cafe: 3, park: 1 }, // 덕진동
  '5211367000': { city: true, cafe: 3, library: 1 }, // 혁신동
  '5280036000': { coast: true, resort: 1, beach: 2 }, // 변산면
  '5280042000': { coast: true, beach: 1, island: 1 }, // 위도면
  // 전남 (화면 밖 5)
  '4615051500': { city: true, cafe: 3 }, // 순천 향동
  '4615062000': { cafe: 4, market: 1 }, // 순천 중앙동
  '4677025300': { coast: true, beach: 1, island: 1 }, // 도양읍
  '4677036000': { coast: true, beach: 2 }, // 봉래면
  '4677044000': { coast: true, beach: 1, surf: 1 }, // 영남면
  // 제주 (화면 밖 4)
  '5011025000': { coast: true, beach: 2, surf: 1 }, // 한림읍
  '5011025300': { coast: true, cafe: 5, beach: 1 }, // 애월읍
  '5011025600': { coast: true, beach: 2, surf: 2 }, // 구좌읍
  '5013061000': { coast: true, resort: 3, beach: 1 }, // 중문동
}
