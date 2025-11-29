'use client'

import { useState, useCallback } from 'react'

interface Plan {
  title: string
  price: string
  description: string
  popular?: boolean
}

interface MembershipsSectionProps {
  title?: string
  subtitle?: string
  plans?: Plan[]
  defaultSelected?: string
  onPlanSelect?: (planTitle: string) => void
  onViewPricing?: () => void
  onFreeTrial?: () => void
}

const defaultPlans: Plan[] = [
  { title: 'Basic', price: '₩49,900', description: '개인 사용자를 위한 기본 플랜' },
  { title: 'Standard', price: '₩99,000', description: '가장 인기 있는 플랜', popular: true },
  { title: 'Pro', price: '₩149,000', description: '전문가를 위한 프리미엄 플랜' },
]

export default function MembershipsSection({
  title = "Memberships",
  subtitle = "반려동물과 함께하는 특별한 경험을 위한 맞춤형 플랜을 선택하세요",
  plans = defaultPlans,
  defaultSelected = "Standard",
  onPlanSelect,
  onViewPricing,
  onFreeTrial
}: MembershipsSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState(defaultSelected)

  const handlePlanSelect = useCallback((planTitle: string) => {
    setSelectedPlan(planTitle)
    onPlanSelect?.(planTitle)
  }, [onPlanSelect])

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6 text-gray-900">{title}</h2>
        <p className="text-lg text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
          {subtitle}
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8 min-h-[300px]">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === plan.title
            const selectedIndex = plans.findIndex(p => p.title === selectedPlan)
            
            let orderClass = ''
            if (isSelected) {
              orderClass = 'order-2 md:order-2' // 선택된 항목을 중앙에
            } else if (index < selectedIndex) {
              orderClass = 'order-1 md:order-1' // 선택된 항목보다 앞에 있는 항목들
            } else {
              orderClass = 'order-3 md:order-3' // 선택된 항목보다 뒤에 있는 항목들
            }
            
            return (
              <div 
                key={plan.title} 
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-700 ease-in-out ${orderClass} ${
                  isSelected
                    ? 'border-black bg-gray-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${
                  !isSelected ? 'blur-[1px] hover:blur-none' : ''
                }`}
                onClick={() => handlePlanSelect(plan.title)}
                style={{
                  transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transform: isSelected ? 'translateY(-12px) scale(1.08)' : 'translateY(0) scale(1)',
                  zIndex: isSelected ? 10 : 1
                }}
              >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    가장 인기
                  </span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                selectedPlan === plan.title ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {plan.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4">/월</p>
              <p className={`text-sm transition-colors duration-300 ${
                selectedPlan === plan.title ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {plan.description}
              </p>
              </div>
            )
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-medium cursor-pointer hover:scale-105 transform duration-200"
            onClick={onViewPricing}
          >
            자세한 가격 보기
          </button>
          <button 
            className="bg-transparent text-black border-2 border-black px-8 py-3 rounded-lg hover:bg-black hover:text-white transition font-medium cursor-pointer hover:scale-105 transform duration-200"
            onClick={onFreeTrial}
          >
            14일 무료 체험
          </button>
        </div>
      </div>
    </section>
  )
}
