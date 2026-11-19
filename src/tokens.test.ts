import { describe, expect, it, vi } from 'vitest'

// 앱 tsconfig 에는 node 타입이 없어(tsc -b) node:fs 를 타입 없이 불러온다.
// vitest 설정이 css: false 라 index.css?raw 는 빈 문자열이 된다
// 경로는 vitest 실행 위치(프로젝트 루트) 기준
const fs = await vi.importActual<{ readFileSync(path: string, encoding: 'utf8'): string }>('node:fs')
const CSS = fs.readFileSync('src/index.css', 'utf8')

/** src 아래 컴포넌트 원문 (테스트 파일 제외) */
const TSX = Object.entries(
  import.meta.glob<string>(['./**/*.tsx', '!./**/*.test.tsx'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)

/** 선택자로 시작하는 줄부터 그 줄 맨 앞 `}` 까지 */
function block(selector: string): string {
  const start = CSS.indexOf(`\n${selector} {`)
  if (start < 0) throw new Error(`${selector} 블록이 없다`)
  return CSS.slice(start, CSS.indexOf('\n}', start + 1))
}
const declared = (s: string) => [...s.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1])
const referenced = (s: string) => [...s.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1])

describe('디자인 토큰', () => {
  it('핑크 바탕 위 글자는 text-text-on-brand (다크에서 text-inverse 는 진하게 뒤집힌다)', () => {
    // glob 이 비면 검사가 헛돈다
    expect(TSX.length).toBeGreaterThan(50)
    const bad = TSX.flatMap(([file, source]) =>
      source
        .split('\n')
        .map((line, i) => ({ file, line: i + 1, text: line }))
        .filter((l) => l.text.includes('bg-brand-primary') && l.text.includes('text-text-inverse')),
    )
    expect(bad.map((b) => `${b.file}:${b.line}`)).toEqual([])
  })
  it('다크 블록과 라이트 범위 블록은 같은 토큰을 같은 순서로 정의한다', () => {
    const dark = declared(block(":root[data-theme='dark']"))
    const light = declared(block("[data-theme='light']"))
    expect(dark.length).toBeGreaterThan(40)
    expect(light).toEqual(dark)
  })
  it('다크·라이트 블록이 고치는 토큰과 참조하는 원시 색은 모두 @theme 에 있다', () => {
    const theme = new Set(declared(block('@theme')))
    for (const sel of [":root[data-theme='dark']", "[data-theme='light']"]) {
      const b = block(sel)
      for (const name of [...declared(b), ...referenced(b)]) expect(theme, `${sel} ${name}`).toContain(name)
    }
  })
  it('다크 블록은 제공자 색·scrim·히트맵·지도 토큰을 건드리지 않는다', () => {
    const dark = declared(block(":root[data-theme='dark']"))
    expect(dark.filter((n) => /kakao|google|scrim|heat-|explore-map-|skeleton-map/.test(n))).toEqual([])
  })
})
