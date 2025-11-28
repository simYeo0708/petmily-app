'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function OAuth2RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    
    if (accessToken) {
      // AuthContext의 handleOAuthCallback 호출
      handleOAuthCallback(accessToken)
        .then(() => {
          // 성공 시 홈으로 리다이렉트
          router.push('/')
        })
        .catch((error) => {
          console.error('OAuth callback error:', error)
          // 에러 시 로그인 페이지로 리다이렉트
          router.push('/login')
        })
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      router.push('/login')
    }
  }, [searchParams, router, handleOAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C59172] mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}

