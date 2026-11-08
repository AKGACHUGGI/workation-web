export type FooterColumn = { title: string; links: { label: string; href: string }[] }

/** Figma Footer(274:4885) 3단 링크. 연결 대상이 아직 없는 항목은 '#' */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: '지원',
    links: [
      { label: '이용 가이드', href: '#' },
      { label: '데이터 출처와 지표 공식', href: '#' },
      { label: '문의하기', href: '#' },
      { label: '신고 처리 기준', href: '#' },
    ],
  },
  {
    title: '데이터',
    links: [
      { label: 'LG U+ 유동인구 · 서비스인구 2025', href: '#' },
      { label: '대상 12개 시군구 · 행정동 204곳', href: '#' },
      { label: '지표 정의서 v0.3', href: '#' },
      { label: 'API 문서 /api/v1', href: '#' },
    ],
  },
  {
    title: '워케이션맵',
    links: [
      { label: '팀 아카츠키 소개', href: '#' },
      { label: '워케이션 노트 가이드라인', href: '#' },
      { label: '지자체 제휴 문의', href: '#' },
      { label: '채용', href: '#' },
    ],
  },
]
