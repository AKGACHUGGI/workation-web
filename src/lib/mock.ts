/** VITE_USE_MOCK=true 이면 features/*\/api.ts 가 src/mocks 데이터를 반환한다 */
export const isMock = import.meta.env.VITE_USE_MOCK === 'true'

/** 네트워크 지연을 흉내 내며 mock 데이터를 반환한다 (기본 200ms) */
export function mockDelay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}
