/** 10월 가상 즐겨찾기·조회수 (스펙 §9). 다른 달은 index.ts 가 이 값에서 결정적으로 파생한다. */
export const OCT_COUNTS: Record<string, { favoriteCount: number; viewCount: number }> = {
  '51820': { favoriteCount: 1284, viewCount: 8200 }, // 고성
  '51830': { favoriteCount: 1172, viewCount: 7900 }, // 양양
  '50130': { favoriteCount: 1036, viewCount: 9400 }, // 서귀포
  '51150': { favoriteCount: 988, viewCount: 11200 }, // 강릉
  '50110': { favoriteCount: 941, viewCount: 12600 }, // 제주
  '51210': { favoriteCount: 873, viewCount: 6800 }, // 속초
  '52110': { favoriteCount: 652, viewCount: 7100 }, // 전주
  '46150': { favoriteCount: 418, viewCount: 3900 }, // 순천
  '51170': { favoriteCount: 377, viewCount: 2800 }, // 동해
  '52800': { favoriteCount: 305, viewCount: 2400 }, // 부안
  '52140': { favoriteCount: 221, viewCount: 1900 }, // 정읍
  '46770': { favoriteCount: 164, viewCount: 1300 }, // 고흥
}
