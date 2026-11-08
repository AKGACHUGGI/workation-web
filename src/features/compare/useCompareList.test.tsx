import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { useCompareList } from '@/features/compare/useCompareList'
import { COMPARE_STORAGE_KEY } from '@/features/compare/storage'

const VALID = ['a', 'b', 'c', 'd']

function Probe({ validIds }: { validIds?: readonly string[] }) {
  const { ids, add, remove, canAdd, dropped } = useCompareList(validIds)
  return (
    <div>
      <output data-testid="ids">{ids.join(',')}</output>
      <output data-testid="dropped">{dropped.join(',')}</output>
      <output data-testid="canAdd">{String(canAdd)}</output>
      <button onClick={() => add('c')}>add c</button>
      <button onClick={() => add('d')}>add d</button>
      <button onClick={() => remove('a')}>remove a</button>
    </div>
  )
}

describe('useCompareList', () => {
  beforeEach(() => localStorage.clear())

  it('쿼리의 dongs 를 읽는다', () => {
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?dongs=a,b' })
    expect(screen.getByTestId('ids')).toHaveTextContent('a,b')
    expect(screen.getByTestId('canAdd')).toHaveTextContent('true')
  })

  it('쿼리가 없으면 localStorage 를 replace 로 복원한다', async () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, '["b","a"]')
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?month=2025-10' })
    expect(await screen.findByText('/compare?month=2025-10&dongs=b%2Ca')).toBeInTheDocument()
    expect(screen.getByTestId('ids')).toHaveTextContent('b,a')
  })

  it('추가하면 URL(push)과 storage 가 갱신된다', async () => {
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?dongs=a' })
    await userEvent.click(screen.getByText('add c'))
    expect(screen.getByTestId('location')).toHaveTextContent('/compare?dongs=a%2Cc')
    expect(localStorage.getItem(COMPARE_STORAGE_KEY)).toBe('["a","c"]')
  })

  it('3개면 canAdd=false 이고 add 는 무시된다', async () => {
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?dongs=a,b,c' })
    expect(screen.getByTestId('canAdd')).toHaveTextContent('false')
    await userEvent.click(screen.getByText('add d'))
    expect(screen.getByTestId('ids')).toHaveTextContent('a,b,c')
  })

  it('무효 id 는 제거·dropped 보고·URL replace 보정', async () => {
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?dongs=a,x' })
    expect(await screen.findByText('/compare?dongs=a')).toBeInTheDocument()
    expect(screen.getByTestId('dropped')).toHaveTextContent('x')
  })

  it('마지막 하나를 제거하면 dongs 쿼리가 사라지고 storage 는 빈 배열', async () => {
    renderWithRouter(<Probe validIds={VALID} />, { route: '/compare?dongs=a' })
    await userEvent.click(screen.getByText('remove a'))
    expect(screen.getByTestId('location')).toHaveTextContent('/compare')
    expect(screen.getByTestId('ids')).toHaveTextContent('')
    expect(localStorage.getItem(COMPARE_STORAGE_KEY)).toBe('[]')
  })
})
