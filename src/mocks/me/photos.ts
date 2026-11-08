import type { MyPhoto } from '@/features/me/types'

export const myPhotosMock: MyPhoto[] = [
  {
    id: 'ph-1',
    url: '/mock-photos/51820.jpg',
    month: '2025-10',
    regionName: '고성군',
    status: 'approved',
  },
  {
    id: 'ph-2',
    url: '/mock-photos/51150.jpg',
    month: '2025-07',
    regionName: '강릉시',
    status: 'approved',
  },
  {
    id: 'ph-3',
    url: '/mock-photos/50130.jpg',
    month: '2025-10',
    regionName: '서귀포시',
    status: 'pending',
  },
  {
    id: 'ph-4',
    url: '/mock-photos/51820.jpg',
    month: '2025-10',
    regionName: '고성군',
    status: 'pending',
  },
]
