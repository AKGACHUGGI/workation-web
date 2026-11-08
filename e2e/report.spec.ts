import { expect, test } from '@playwright/test'

test.describe('W-06 지자체 진단 리포트', () => {
  test('진입: 고성군 카드 값과 순위표 강조', async ({ page }) => {
    await page.goto('/reports/51820')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('지자체 진단 리포트')
    await expect(page.getByText('35 %')).toBeVisible()
    await expect(page.getByText('83 점')).toBeVisible()
    await expect(page.getByText('5 위 / 12')).toBeVisible()
    await expect(page.getByRole('row', { name: /고성군/ })).toHaveAttribute('aria-current', 'true')
  })

  test('시군구 전환: 드롭다운 양양군 → URL 과 카드 값 변경', async ({ page }) => {
    await page.goto('/reports/51820?preset=quiet')
    await page.getByRole('button', { name: '시군구: 고성군' }).click()
    await page
      .getByRole('listbox', { name: '시군구' })
      .getByRole('option', { name: '양양군' })
      .click()
    await expect(page).toHaveURL(/\/reports\/51830\?preset=quiet$/)
    await expect(page.getByRole('button', { name: '시군구: 양양군' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(page.getByText('41 %')).toBeVisible()
    await expect(page.getByText('1 위 / 12')).toBeVisible()
  })

  test('preset=custom 은 quiet 로 보정', async ({ page }) => {
    await page.goto('/reports/51820?preset=custom')
    await expect(page).toHaveURL(/preset=quiet/)
  })

  test('PDF 내보내기: 파일명 고성군_진단리포트_2025.pdf', async ({ page }) => {
    await page.goto('/reports/51820')
    await expect(page.getByText('35 %')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'PDF 내보내기' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('고성군_진단리포트_2025.pdf')
  })
})
