/** 문자열 → 32비트 부호 없는 정수 (FNV-1a). 같은 문자열이면 늘 같은 값 (그래프 씨앗 위치·mock 생성용) */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
