import { expect, test } from '@playwright/test'

test.describe('다크모드', () => {
  test('해/달 버튼으로 다크로 바꾸면 새로고침해도 유지된다', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: '다크 모드로 전환' }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 22, 22)')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: '라이트 모드로 전환' })).toBeVisible()
  })

  test('저장값이 없으면 시스템 다크 설정으로 시작한다', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('다크에서도 지도 영역은 라이트다', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/explore')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    // 로컬은 .env 지도 키로 실제 지도가, CI 는 MapPlaceholder 가 뜬다. 어느 쪽이든 지도 범위가 계산한 토큰 값을 본다
    const scope = page.locator('[data-slot="map-scope"]').first()
    const token = (name: string) =>
      scope.evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name)
    await expect.poll(() => token('--color-bg-subtle')).toBe('#f7f7f7')
    expect(await token('--color-text-primary')).toBe('#222222')
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue('--color-text-primary').trim(),
      ),
    ).toBe('#f2f2f2')
  })
})
