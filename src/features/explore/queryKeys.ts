export const exploreKeys = {
  all: ['explore'] as const,
  pins: (sigunguId: string) => ['explore', 'pins', sigunguId] as const,
  dong: (dongId: string) => ['explore', 'dong', dongId] as const,
}
