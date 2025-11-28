'use client'

import { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: { monthly: number; annual: number }
  description: string
  icon: ReactNode
  color: string
  features: string[]
  popular?: boolean
  isAnnual?: boolean
  isSelected?: boolean
  onSelect?: () => void
  className?: string
}

export default function PricingCard({
  name,
  price,
  description,
  icon,
  color,
  features,
  popular = false,
  isAnnual = false,
  isSelected = false,
  onSelect,
  className = ''
}: PricingCardProps) {
  const currentPrice = isAnnual ? price.annual : price.monthly
  const monthlyPrice = isAnnual ? Math.round(price.annual / 12) : price.monthly

  return (
    <div
      className={`relative p-4 sm:p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-700 ease-in-out border-2 h-full flex flex-col ${
        isSelected
          ? 'border-[#C59172] bg-white transform -translate-y-2 shadow-xl scale-105'
          : 'border-gray-200 bg-white/90 hover:border-gray-300 scale-100'
      } ${
        !isSelected ? 'blur-[1px] hover:blur-none' : ''
      } ${className}`}
      onClick={onSelect}
      style={{
        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: isSelected ? 'translateY(-12px) scale(1.08)' : 'translateY(0) scale(1)',
        zIndex: isSelected ? 10 : 1
      }}
    >
      {popular && (
        <div className="absolute -top-2 sm:-top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[#C59172] text-white px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
            가장 인기
          </span>
        </div>
      )}
      
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="bg-[#C59172]/10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{name}</h3>
        </div>
        <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{description}</p>
        <div className="mb-3 sm:mb-4">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            ₩{currentPrice.toLocaleString()}
          </span>
          <span className="text-gray-600 ml-1 sm:ml-2 text-sm sm:text-base">
            /{isAnnual ? '년' : '월'}
          </span>
        </div>
        {isAnnual && (
          <p className="text-xs sm:text-sm text-gray-500">
            월 ₩{monthlyPrice.toLocaleString()}로 절약
          </p>
        )}
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#C59172] mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition text-sm sm:text-base ${
          popular
            ? 'bg-[#C59172] text-white hover:bg-[#B07A5C]'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {isAnnual ? '연간 플랜 시작하기' : '월간 플랜 시작하기'}
      </button>
    </div>
  )
}
