import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// 다른 화면으로 넘어가면 맨 위에서 시작한다. 경로가 바뀔 때만 올리므로
// 같은 화면에서 쿼리(월·가중치 등)만 바꿀 때는 보던 위치를 지킨다.
// 뒤로·앞으로 가기(POP)는 브라우저가 기억한 위치를 그대로 둔다.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  const prev = useRef(pathname)

  useEffect(() => {
    if (prev.current === pathname) return
    prev.current = pathname
    if (type !== 'POP') window.scrollTo(0, 0)
  }, [pathname, type])

  return null
}
