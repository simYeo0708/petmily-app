'use client'

import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChevronDown, User, Settings, LogOut, UserCircle } from 'lucide-react'

export default function Header() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleGetToService = useCallback(() => {
    router.push('/downloads')
  }, [router])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/')
  }, [logout, router])

  const handleLogin = useCallback(() => {
    router.push('/login')
  }, [router])

  const handleSignup = useCallback(() => {
    router.push('/register')
  }, [router])


  return (
    <header className="w-full fixed top-0 left-0 z-60 bg-slate-300/60 backdrop-blur-md shadow-sm">
      <div className="max-w-[100rem] mx-auto py-4 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Image src="/icons/dog-paw.png" alt="Petmily Logo" width={28} height={28} />
          <Link href="/" className="font-bold text-black text-xl" style={{fontFamily:'Josefin Sans, sans-serif'}}>Petmily</Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex gap-12 text-[18px] font-[10] text-black" style={{fontFamily: 'Inter, sans-serif'}}>
          <Link href="/about" className="text-lg transition font-bold hover:text-[#C59172]">About Us</Link>
          <Link href="/pricing" className="text-lg transition font-bold hover:text-[#C59172]">Pricing</Link>
          <Link href="/downloads" className="text-lg transition font-bold hover:text-[#C59172]">Downloads</Link>
        </nav>

        {/* Right: Button + Avatar/Login */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGetToService}
            disabled={loading}
            className="bg-[#C59172] hover:bg-[#b07a5c] text-white text-sm font-semibold text-[14px] px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
            style={{fontFamily:'Inter, sans-serif'}}
          >
            {loading ? 'Loading...' : 'Get the app'}
          </button>
          
          {isAuthenticated ? (
            <div className="relative group">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name || "User Avatar"}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-gray-300 hover:border-[#C59172] transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[#C59172] transition-colors bg-gray-100 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 text-[#C59172]" />
                      프로필
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4 text-[#C59172]" />
                      설정
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsUserMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 text-[#C59172]" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogin}
                className="text-[#C59172] hover:text-[#b07a5c] text-sm font-semibold px-4 py-2 rounded transition"
                style={{fontFamily:'Inter, sans-serif'}}
              >
                로그인
              </button>
              <button
                onClick={handleSignup}
                className="bg-[#C59172] hover:bg-[#b07a5c] text-white text-sm font-semibold px-4 py-2 rounded transition"
                style={{fontFamily:'Inter, sans-serif'}}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
