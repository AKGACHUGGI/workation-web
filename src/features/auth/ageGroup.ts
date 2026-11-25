/** 온보딩에서 받는 연령대. 서버 `app_user.age_group` 저장값과 같다 */
export const AGE_GROUPS = ['10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'] as const
export type AgeGroup = (typeof AGE_GROUPS)[number]
export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s': '60대',
  '70s': '70대',
  '80s': '80대',
  '90s': '90대',
}
