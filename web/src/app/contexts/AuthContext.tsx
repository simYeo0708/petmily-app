'use client'

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '../../lib/api'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
  phone?: string
  address?: string
}

// interface AuthResponse {
//   token: string
//   user: User
// }

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: {
    name: string
    email: string
    password: string
    phone?: string
    address?: string
  }) => Promise<boolean>
  logout: () => void
  loading: boolean
  redirectAfterAuth: () => void
  refreshToken: () => Promise<boolean>
  handleOAuthCallback: (accessToken: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    const initializeAuth = async () => {
      try {
        // Check if user is logged in (check localStorage for token and user)
        const token = localStorage.getItem('petmily_token')
        const savedUser = localStorage.getItem('petmily_user')
        
        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            
            // Verify token is still valid by making a test API call
            // For now, we'll just check if token exists and is not expired
            const tokenParts = token.split('.')
            if (tokenParts.length === 3) {
              try {
                const payload = JSON.parse(atob(tokenParts[1]))
                const currentTime = Math.floor(Date.now() / 1000)
                
                // Check if token is expired
                if (payload.exp && payload.exp > currentTime) {
                  setUser(userData)
                } else {
                  // Token expired, clear storage
                  localStorage.removeItem('petmily_user')
                  localStorage.removeItem('petmily_token')
                }
              } catch (error) {
                // Invalid token format, clear storage
                localStorage.removeItem('petmily_user')
                localStorage.removeItem('petmily_token')
              }
            }
          } catch (error) {
            console.error('Error parsing saved user:', error)
            localStorage.removeItem('petmily_user')
            localStorage.removeItem('petmily_token')
          }
        }

        // Check for OAuth token in URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const oauthToken = urlParams.get('token')
        if (oauthToken) {
          // Store token and redirect to remove token from URL
          localStorage.setItem('petmily_token', oauthToken)
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // You can decode the token here to get user info or make an API call
          // For now, we'll just store the token
          console.log('OAuth token received:', oauthToken)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    // Listen for logout events from API interceptor
    const handleLogoutEvent = () => {
      setUser(null)
    }

    window.addEventListener('auth:logout', handleLogoutEvent)

    initializeAuth()

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      // 백엔드는 username을 사용하므로 email을 username으로 사용
      const response = await authAPI.login({ username: email, password })
      
      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken, userId, username, email: userEmail } = response.data
        
        // Store token
        localStorage.setItem('petmily_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('petmily_refresh_token', refreshToken)
        }
        
        // Create user object from response
        const userData: User = {
          id: userId,
          name: username, // username을 name으로 사용 (추후 /auth/me로 실제 이름 가져올 수 있음)
          email: userEmail || email,
        }
        
        localStorage.setItem('petmily_user', JSON.stringify(userData))
        setUser(userData)
        
        // Redirect after successful login with a small delay to allow UI updates
        setTimeout(() => {
          redirectAfterAuth()
        }, 100)
        
        return true
      } else {
        console.error('Invalid response format:', response.data)
        return false
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number; data?: { message?: string } } }
        if (err.response?.status === 401) {
          console.error('Invalid credentials')
        } else if (err.response?.status === 400) {
          console.error('Bad request:', err.response.data?.message)
        } else if (err.response && err.response.status && err.response.status >= 500) {
          console.error('Server error')
        }
      }
      
      return false
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    phone?: string
    address?: string
  }): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      // 백엔드는 username을 사용하므로 email을 username으로 사용
      const response = await authAPI.register({
        username: userData.email,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
      })
      
      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken, userId, username, email: userEmail } = response.data
        
        // Store token
        localStorage.setItem('petmily_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('petmily_refresh_token', refreshToken)
        }
        
        // Create user object from response
        const newUser: User = {
          id: userId,
          name: userData.name,
          email: userEmail || userData.email,
          phone: userData.phone,
          address: userData.address,
        }
        
        localStorage.setItem('petmily_user', JSON.stringify(newUser))
        setUser(newUser)
        
        return true
      } else {
        console.error('Invalid response format:', response.data)
        return false
      }
    } catch (error: unknown) {
      console.error('Registration error:', error)
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number; data?: { message?: string } } }
        if (err.response?.status === 400) {
          console.error('Bad request:', err.response.data?.message)
        } else if (err.response?.status === 409) {
          console.error('User already exists')
        } else if (err.response && err.response.status && err.response.status >= 500) {
          console.error('Server error')
        }
      }
      
      return false
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('petmily_user')
      localStorage.removeItem('petmily_token')
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    try {
      const refreshTokenValue = localStorage.getItem('petmily_refresh_token')
      if (!refreshTokenValue) {
        logout()
        return false
      }

      // 백엔드 API를 통해 토큰 갱신
      const response = await authAPI.refreshToken(refreshTokenValue)
      
      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        // 새 토큰 저장
        localStorage.setItem('petmily_token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('petmily_refresh_token', newRefreshToken)
        }
        
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  const redirectAfterAuth = () => {
    if (typeof window === 'undefined') return
    
    // 가장 최근 방문한 페이지를 확인
    const lastVisitedPage = localStorage.getItem('petmily_last_visited_page')
    
    if (lastVisitedPage && lastVisitedPage !== '/login' && lastVisitedPage !== '/register') {
      // 유효한 페이지로 리다이렉트
      router.push(lastVisitedPage)
    } else {
      // 기본적으로 홈 페이지로 이동
      router.push('/')
    }
  }

  const handleOAuthCallback = async (accessToken: string) => {
    if (typeof window === 'undefined') return
    
    try {
      // AccessToken 저장
      localStorage.setItem('petmily_token', accessToken)
      
      // 사용자 정보 가져오기
      const response = await authAPI.getCurrentUser()
      
      if (response.data) {
        const userData: User = {
          id: response.data.id || response.data.userId,
          name: response.data.name || response.data.username,
          email: response.data.email,
          avatar: response.data.profile || response.data.avatar,
          phone: response.data.phone,
          address: response.data.address,
        }
        
        localStorage.setItem('petmily_user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw error
    }
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    redirectAfterAuth,
    refreshToken
  }), [user, loading, router])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
