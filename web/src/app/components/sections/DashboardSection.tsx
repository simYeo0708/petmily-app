'use client'

import { SAMPLE_DASHBOARD_DATA } from '@/data/sampleData'
import { TrendingUp, Star, Users, RefreshCw } from 'lucide-react'

export default function DashboardSection() {
  const { earningsInfo, statisticsInfo, upcomingBookings, weeklyEarnings } = SAMPLE_DASHBOARD_DATA
  
  const chartMaxValue = Math.max(...weeklyEarnings.map(item => item.earnings), 1)
  
  const quickMetrics = [
    {
      icon: TrendingUp,
      label: "이번 주 수익",
      value: `${earningsInfo.thisWeekEarnings.toLocaleString()}원`,
      color: "#C59172",
    },
    {
      icon: Star,
      label: "평균 평점",
      value: `${statisticsInfo.averageRating.toFixed(1)} / 5`,
      color: "#FFC107",
    },
    {
      icon: Users,
      label: "총 산책 횟수",
      value: `${statisticsInfo.totalWalks}회`,
      color: "#2196F3",
    },
    {
      icon: RefreshCw,
      label: "재요청률",
      value: `${statisticsInfo.repeatRate.toFixed(1)}%`,
      color: "#4CAF50",
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

  return (
    <section className="bg-gradient-to-b from-[#D5CDC9] via-[#CBB7A2] to-[#D8CAB8] py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-center mb-8 md:mb-12 text-gray-800">워커 대시보드</h2>
        
        {/* Hero Card - 총 누적 수익 */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="text-sm text-gray-600 mb-2">총 누적 수익</div>
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {earningsInfo.totalEarnings.toLocaleString()}원
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div>
              <div className="text-xs text-gray-500 mb-1">이번 달 수익</div>
              <div className="text-lg font-semibold text-gray-900">
                {earningsInfo.thisMonthEarnings.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">다음 정산 예정</div>
              <div className="text-lg font-semibold text-gray-900">
                {earningsInfo.nextPayoutDate}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                지난달 대비 {earningsInfo.growthRate.toFixed(1)}% 성장
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 font-medium">
                평균 평점 {statisticsInfo.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

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

        {/* Chart Card - 주간 수익 추이 */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">최근 5주 수익 추이</h3>
              <p className="text-sm text-gray-600">주간 평균 +{earningsInfo.growthRate.toFixed(1)}% 상승 중</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">이번 주</div>
              <div className="text-xl font-bold text-[#C59172]">
                {earningsInfo.thisWeekEarnings.toLocaleString()}원
              </div>
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyEarnings.map((item, index) => {
              const barHeight = Math.max(12, Math.round((item.earnings / chartMaxValue) * 140))
              const isLatest = index === weeklyEarnings.length - 1
              
              return (
                <div key={item.weekLabel} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2 text-center">
                    {(item.earnings / 1000).toFixed(0)}k
                  </div>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: isLatest ? '#C59172' : '#E5D3C5',
                    }}
                  />
                  <div className="text-xs text-gray-600 mt-2 text-center">{item.weekLabel}</div>
                </div>
              )
            })}
          </div>
        </div>

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
                        {formatDate(booking.date)} · {booking.timeSlot}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {booking.status === 'CONFIRMED' ? '확정' : '대기중'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      {booking.petName} ({booking.petBreed})
                    </div>
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
