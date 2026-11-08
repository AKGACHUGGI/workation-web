import { describe, expect, it } from 'vitest'
import { METRIC_DEFINITION, METRIC_SHORT_LABEL, PRESET_LABEL } from '@/features/metric/constants'
import { METRIC_KEYS } from '@/features/metric/types'

describe('문구 사전', () => {
  it('짧은 라벨은 METRIC_KEYS 순서로 조용·시기·또래·숙박·활기', () => {
    expect(METRIC_KEYS.map((k) => METRIC_SHORT_LABEL[k])).toEqual([
      '조용',
      '시기',
      '또래',
      '숙박',
      '활기',
    ])
  })
  it('프리셋 라벨', () => {
    expect(PRESET_LABEL).toEqual({
      quiet: '조용한 곳',
      lively: '활기 있는 한 달',
      custom: '직접 설정',
    })
  })
  it('지표 정의는 화면 라벨로 시작한다', () => {
    expect(METRIC_DEFINITION.quiet).toBe('동네 조용함 = 평일 낮 체류 ÷ 새벽 체류, 낮을수록 조용')
    for (const k of METRIC_KEYS) expect(METRIC_DEFINITION[k].length).toBeGreaterThan(5)
  })
})
