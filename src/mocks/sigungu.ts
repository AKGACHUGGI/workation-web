import type { Terrain } from '@/features/tier/types'

export type SigunguMeta = {
  id: string
  name: string
  province: string
  photoUrl: string
  terrain: Terrain[]
  tags: string[]
}

const photo = (id: string) => `/mock-photos/${id}.jpg`

/** 12개 시군구 수동 메타. terrain·tags 는 W-01 카드·필터와 공유한다 */
export const SIGUNGU: SigunguMeta[] = [
  {
    id: '51820',
    name: '고성군',
    province: '강원특별자치도',
    photoUrl: photo('51820'),
    terrain: ['coast'],
    tags: ['해안', '속초시 인접'],
  },
  {
    id: '51210',
    name: '속초시',
    province: '강원특별자치도',
    photoUrl: photo('51210'),
    terrain: ['coast', 'city'],
    tags: ['해안', '도시'],
  },
  {
    id: '51830',
    name: '양양군',
    province: '강원특별자치도',
    photoUrl: photo('51830'),
    terrain: ['coast'],
    tags: ['해안', '서핑'],
  },
  {
    id: '51150',
    name: '강릉시',
    province: '강원특별자치도',
    photoUrl: photo('51150'),
    terrain: ['coast', 'city'],
    tags: ['해안', '도시'],
  },
  {
    id: '51170',
    name: '동해시',
    province: '강원특별자치도',
    photoUrl: photo('51170'),
    terrain: ['coast'],
    tags: ['해안'],
  },
  {
    id: '52110',
    name: '전주시',
    province: '전북특별자치도',
    photoUrl: photo('52110'),
    terrain: ['city'],
    tags: ['도시', '한옥마을'],
  },
  {
    id: '52140',
    name: '정읍시',
    province: '전북특별자치도',
    photoUrl: photo('52140'),
    terrain: ['mountain'],
    tags: ['산간', '내장산'],
  },
  {
    id: '52800',
    name: '부안군',
    province: '전북특별자치도',
    photoUrl: photo('52800'),
    terrain: ['coast'],
    tags: ['해안', '변산반도'],
  },
  {
    id: '46150',
    name: '순천시',
    province: '전라남도',
    photoUrl: photo('46150'),
    terrain: ['city'],
    tags: ['도시', '순천만'],
  },
  {
    id: '46770',
    name: '고흥군',
    province: '전라남도',
    photoUrl: photo('46770'),
    terrain: ['coast'],
    tags: ['해안', '우주센터'],
  },
  {
    id: '50110',
    name: '제주시',
    province: '제주특별자치도',
    photoUrl: photo('50110'),
    terrain: ['coast', 'city'],
    tags: ['해안', '도시'],
  },
  {
    id: '50130',
    name: '서귀포시',
    province: '제주특별자치도',
    photoUrl: photo('50130'),
    terrain: ['coast', 'mountain'],
    tags: ['해안', '한라산 남쪽'],
  },
]
