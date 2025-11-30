'use client'

import { useState, useEffect } from 'react'
import { dashboardAPI, DashboardResponse } from '@/lib/dashboardAPI'
import { TrendingUp, Star, Users, RefreshCw, Activity } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function DashboardSection() {
  const { isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const response = await dashboardAPI.getDashboard()
      if (response.data?.data) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 샘플 데이터를 대시보드 데이터로 변환
  const walkingStats = dashboardData?.walkingStats || {
    totalCompletedWalks: 0,
    upcomingWalks: 0,
    walkingHoursThisMonth: 0,
    totalAmountSpent: 0,
    averageRating: 0,
  }

  const upcomingBookings = dashboardData?.upcomingBookings || []
  
  const quickMetrics = [
    {
      icon: Activity,
      label: "완료한 산책",
      value: `${walkingStats.totalCompletedWalks}회`,
      color: "#2196F3",
    },
    {
      icon: Star,
      label: "평균 평점",
      value: `${walkingStats.averageRating.toFixed(1)} / 5`,
      color: "#FFC107",
    },
    {
      icon: TrendingUp,
      label: "이번 달 산책 시간",
      value: `${walkingStats.walkingHoursThisMonth}시간`,
      color: "#4CAF50",
    },
    {
      icon: Users,
      label: "예정된 산책",
      value: `${walkingStats.upcomingWalks}건`,
      color: "#C59172",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '오늘'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '내일'
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-gradient-to-b from-[#D5CDC9] via-[#CBB7A2] to-[#D8CAB8] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg text-center">
            <p className="text-gray-600">로그인 후 대시보드를 확인할 수 있습니다.</p>
          </div>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="bg-gradient-to-b from-[#D5CDC9] via-[#CBB7A2] to-[#D8CAB8] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C59172] mx-auto"></div>
            <p className="mt-4 text-gray-600">대시보드 데이터를 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-b from-[#D5CDC9] via-[#CBB7A2] to-[#D8CAB8] py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800">마이 대시보드</h2>
        
        {/* Hero Card - 사용자 정보 및 통계 */}
        {dashboardData?.userInfo && (
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
            <div className="text-sm text-gray-600 mb-2">안녕하세요, {dashboardData.userInfo.name}님</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {dashboardData.userInfo.email}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div>
                <div className="text-xs text-gray-500 mb-1">완료한 산책</div>
                <div className="text-lg font-semibold text-gray-900">
                  {walkingStats.totalCompletedWalks}회
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">예정된 산책</div>
                <div className="text-lg font-semibold text-gray-900">
                  {walkingStats.upcomingWalks}건
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  이번 달 {walkingStats.walkingHoursThisMonth}시간 산책
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  평균 평점 {walkingStats.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {quickMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                <Icon className="w-6 h-6 mb-3" style={{ color: metric.color }} />
                <div className="text-lg font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            )
          })}
        </div>

        {/* 반려동물 정보 */}
        {dashboardData?.myPets && dashboardData.myPets.length > 0 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">내 반려동물</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.myPets.map((pet) => (
                <div key={pet.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="text-lg font-semibold text-gray-900">{pet.name}</div>
                  <div className="text-sm text-gray-600">{pet.breed}</div>
                  <div className="text-xs text-gray-500 mt-1">{pet.age}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">다가오는 산책 일정</h3>
            <button className="text-sm text-[#C59172] hover:text-[#b07a5c] font-medium">
              전체 보기
            </button>
          </div>
          
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#C59172] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🐾</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700' 
                          : booking.status === 'PENDING'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED' ? '확정' : 
                         booking.status === 'PENDING' ? '대기중' : booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {booking.petName} ({booking.petBreed})
                    </div>
                    {booking.address && (
                      <div className="text-xs text-gray-500 mb-1">{booking.address}</div>
                    )}
                    {booking.notes && (
                      <div className="text-xs text-gray-500">{booking.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              다가오는 산책 일정이 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
