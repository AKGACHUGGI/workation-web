import type { LucideIcon } from 'lucide-react'
import { Building, Calendar, Coffee, Laptop, Moon, Mountain, Users, Waves } from 'lucide-react'
import type { PresetKey } from '@/features/metric/types'
import type { Terrain } from '@/features/popular/types'

export type CategoryAction =
  | { kind: 'terrain'; value: Terrain }
  | { kind: 'preset'; value: Exclude<PresetKey, 'custom'> }
  | { kind: 'none' }

export type Category = { key: string; label: string; icon: LucideIcon; action: CategoryAction }

/** 스펙 §3-2. 아이콘은 Figma CategoryTab(51:311) swap 목록. 한 달 살기·워케이션은 2차 stay 필터 검토 전까지 장식 */
export const CATEGORIES: Category[] = [
  { key: 'coast', label: '해안', icon: Waves, action: { kind: 'terrain', value: 'coast' } },
  {
    key: 'mountain',
    label: '산간',
    icon: Mountain,
    action: { kind: 'terrain', value: 'mountain' },
  },
  { key: 'city', label: '도시', icon: Building, action: { kind: 'terrain', value: 'city' } },
  { key: 'quiet', label: '조용한 곳', icon: Coffee, action: { kind: 'preset', value: 'quiet' } },
  { key: 'stay', label: '한 달 살기', icon: Calendar, action: { kind: 'none' } },
  { key: 'peer', label: '또래', icon: Users, action: { kind: 'preset', value: 'lively' } },
  { key: 'vibe', label: '저녁 활기', icon: Moon, action: { kind: 'preset', value: 'lively' } },
  { key: 'work', label: '워케이션', icon: Laptop, action: { kind: 'none' } },
]
