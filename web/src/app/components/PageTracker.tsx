'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  const updateLastVisitedPage = useCallback((currentPath: string) => {
    // 로그인/회원가입 페이지가 아닌 경우에만 저장
    if (currentPath && !currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
      localStorage.setItem('petmily_last_visited_page', currentPath)
    }
  }, [])

  useEffect(() => {
    updateLastVisitedPage(pathname)
  }, [pathname, updateLastVisitedPage])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}
