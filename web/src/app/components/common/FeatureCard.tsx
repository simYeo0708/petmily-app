'use client'

import { ReactNode } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  color?: string
  details?: string[]
  className?: string
  variant?: 'default' | 'detailed' | 'simple'
}

export default function FeatureCard({
  title,
  description,
  icon,
  color = 'from-[#C59172] to-[#B07A5C]',
  details = [],
  className = '',
  variant = 'default'
}: FeatureCardProps) {
  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-br ${color} p-8 rounded-xl shadow-lg backdrop-blur-sm ${className}`}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-white/90 text-lg mb-6">{description}</p>
            {details.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span className="text-white/90">{detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'simple') {
    return (
      <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center ${className}`}>
        <div className="bg-[#C59172]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg backdrop-blur-sm ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-sm">{description}</p>
      </div>
    </div>
  )
}
