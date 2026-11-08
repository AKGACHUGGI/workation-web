import { expect, test } from '@playwright/test'

const GEOJIN = '5182025300' // 거진읍
const GEUMHO = '5121053500' // 금호동
const YEON = '5011062000' // 연동

test.describe('W-05 동네 비교', () => {
  test('링크 진입: 열 2개 + 빈 열 1개', async ({ page }) => {
    await page.goto(`/compare?dongs=${GEOJIN},${GEUMHO}&month=2025-10`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('동네 비교')
    await expect(page.getByRole('article', { name: '거진읍' })).toBeVisible()
    await expect(page.getByRole('article', { name: '금호동' })).toBeVisible()
    await expect(page.getByText('비교할 동네를 추가하세요')).toHaveCount(1)
  })

  test('추가·제거', async ({ page }) => {
    await page.goto(`/compare?dongs=${GEOJIN},${GEUMHO}&month=2025-10`)
    await page.getByRole('button', { name: '+ 행정동 추가' }).click()
    const dialog = page.getByRole('dialog', { name: '행정동 추가' })
    await dialog.getByRole('searchbox').fill('연동')
    await dialog.getByRole('option', { name: /연동/ }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('article', { name: '연동' })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`dongs=${GEOJIN}%2C${GEUMHO}%2C${YEON}`))
    await expect(page.getByRole('button', { name: '+ 행정동 추가' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    await page
      .getByRole('article', { name: '거진읍' })
      .getByRole('button', { name: '거진읍 제거' })
      .click()
    await expect(page.getByRole('article', { name: '거진읍' })).toHaveCount(0)
    await expect(page.getByRole('article')).toHaveCount(2)
  })

  test('복원: 쿼리 없이 들어가면 마지막 목록이 채워진다', async ({ page }) => {
    await page.goto(`/compare?dongs=${GEOJIN},${YEON}&month=2025-10`)
    await expect(page.getByRole('article', { name: '연동' })).toBeVisible()
    await page.goto('/compare')
    await expect(page).toHaveURL(new RegExp(`dongs=${GEOJIN}%2C${YEON}`))
    await expect(page.getByRole('article', { name: '연동' })).toBeVisible()
  })
})
