/**
 * 줌 14+ 클러스터 레이어용 DOM 요소. AdvancedMarkerElement content 는 React 밖이라 직접 만든다.
 * 클래스는 Tailwind 가 이 파일도 스캔하므로 토큰 클래스를 그대로 쓴다. 색은 CSS 변수 문자열.
 */
export function pinElement(name: string, color: string, faded: boolean): HTMLElement {
  const el = document.createElement('span')
  el.className = `border-bg-surface shadow-float block size-4 cursor-pointer rounded-full border-2${faded ? ' opacity-faded' : ''}`
  el.style.background = color
  el.title = name
  return el
}

export function clusterElement(count: number): HTMLElement {
  const el = document.createElement('span')
  el.className =
    'bg-bg-inverse text-text-inverse text-caption-xs shadow-float inline-flex size-8 items-center justify-center rounded-full font-bold'
  el.textContent = String(count)
  return el
}
