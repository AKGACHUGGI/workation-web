import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(process.cwd(), 'src')

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return tsxFiles(p)
    return p.endsWith('.tsx') && !p.endsWith('.test.tsx') ? [p] : []
  })
}

describe('디자인 토큰', () => {
  it('핑크 바탕 위 글자는 text-text-on-brand (다크에서 text-inverse 는 진하게 뒤집힌다)', () => {
    const bad = tsxFiles(SRC).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ file, line: i + 1, text: line }))
        .filter((l) => l.text.includes('bg-brand-primary') && l.text.includes('text-text-inverse')),
    )
    expect(bad.map((b) => `${b.file}:${b.line}`)).toEqual([])
  })
})
