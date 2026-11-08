/** window.location.assign 래퍼. 테스트에서 vi.mock('@/lib/navigation') 으로 바꿔 끼운다 */
export function assignLocation(url: string): void {
  window.location.assign(url)
}
