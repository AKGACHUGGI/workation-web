export const MY_TABS = ['favorites', 'tips', 'photos'] as const
export type MyTab = (typeof MY_TABS)[number]
export const DEFAULT_MY_TAB: MyTab = 'favorites'

export function parseMyTab(raw: string | null): MyTab | null {
  if (raw === null) return null
  return (MY_TABS as readonly string[]).includes(raw) ? (raw as MyTab) : null
}
