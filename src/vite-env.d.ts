/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** Google Maps JS API 키. 비어 있으면 MapPlaceholder */
  readonly VITE_GOOGLE_MAPS_KEY?: string
}
