/** Google Maps 키가 설정되어 있는지. 빈 문자열은 없는 것으로 본다. */
export function hasMapsKey(): boolean {
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
  return typeof key === 'string' && key.trim().length > 0
}

export function mapsKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''
}
