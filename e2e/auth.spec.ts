import { expect, test } from '@playwright/test'

/** mock 모드(VITE_USE_MOCK=true). 리다이렉트 없이 mockLogin → 온보딩 → 아바타 */
test.describe('W-07 로그인 모달', () => {
  test('쓰기 동작 → 모달, 둘러보기로 닫힘', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    await page.getByRole('button', { name: '이 지역 즐겨찾기' }).click()
    const dialog = page.getByRole('dialog', { name: '당신의 장소를 찾으세요' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: '카카오로 시작하기' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Google로 시작하기' })).toBeVisible()
    await dialog.getByRole('button', { name: '로그인 없이 둘러보기' }).click()
    await expect(dialog).toBeHidden()
  })

  test('가입 흐름: 카카오 → 온보딩 → 아바타 "두"', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    await page.getByRole('button', { name: '이 지역 즐겨찾기' }).click()
    await page.getByRole('button', { name: '카카오로 시작하기' }).click()
    const onboarding = page.getByRole('dialog', { name: '거의 다 됐어요' })
    await expect(onboarding).toBeVisible()
    await onboarding.getByRole('checkbox', { name: /이용약관/ }).check()
    await onboarding.getByRole('checkbox', { name: /개인정보 처리방침/ }).check()
    await onboarding.getByLabel('닉네임').fill('두이')
    await onboarding.getByRole('button', { name: '시작하기' }).click()
    await expect(onboarding).toBeHidden()
    await expect(page.getByRole('button', { name: '두이 메뉴' })).toHaveText('두')
  })

  test('로그아웃 → 로그인 버튼 복귀', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    await page.getByRole('button', { name: '이 지역 즐겨찾기' }).click()
    await page.getByRole('button', { name: '카카오로 시작하기' }).click()
    const onboarding = page.getByRole('dialog', { name: '거의 다 됐어요' })
    await onboarding.getByRole('checkbox', { name: /이용약관/ }).check()
    await onboarding.getByRole('checkbox', { name: /개인정보 처리방침/ }).check()
    await onboarding.getByRole('button', { name: '시작하기' }).click()
    await page.getByRole('button', { name: '두이 메뉴' }).click()
    await page.getByRole('menuitem', { name: '로그아웃' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
  })
})
