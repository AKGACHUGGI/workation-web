/** 리포트 드롭다운용 12개 시군구 (행정표준코드 5자리). W-02 tier mock 과 같은 id 체계. */
export const SIGUNGU_OPTIONS: { value: string; label: string }[] = [
  { value: '51820', label: '고성군' },
  { value: '51210', label: '속초시' },
  { value: '51830', label: '양양군' },
  { value: '51150', label: '강릉시' },
  { value: '51170', label: '동해시' },
  { value: '52110', label: '전주시' },
  { value: '52140', label: '정읍시' },
  { value: '52800', label: '부안군' },
  { value: '46150', label: '순천시' },
  { value: '46770', label: '고흥군' },
  { value: '50110', label: '제주시' },
  { value: '50130', label: '서귀포시' },
]

export const SIGUNGU_IDS = SIGUNGU_OPTIONS.map((o) => o.value)
