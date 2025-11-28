'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export type ActionButton = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  external?: boolean
  icon?: ReactNode
}

export interface PageIntroProps {
  title: string
  description: string
  tagline?: string
  imagePrompt: string
  actions?: ActionButton[]
  className?: string
}

const variantClasses = {
  primary: 'bg-[#1E1C1A] text-white hover:bg-black shadow-[0_10px_25px_rgba(30,28,26,0.25)]',
  secondary:
    'border border-[#1E1C1A] bg-transparent text-[#1E1C1A] hover:bg-[#1E1C1A] hover:text-white',
}

export default function PageIntro({
  title,
  description,
  tagline,
  imagePrompt,
  actions = [],
  className = '',
}: PageIntroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-[#F7F4F1] via-white to-[#EFE6DC] border-b border-black/5 ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#E2C8B1]/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-[#C5D5CD]/35 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_minmax(0,1fr)] items-center">
          <div className="space-y-8">
            {tagline && (
              <span className="inline-flex items-center rounded-full bg-black text-white text-xs sm:text-sm font-medium uppercase tracking-widest px-3 py-1">
                {tagline}
              </span>
            )}

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1E1C1A] leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-[#3A3835] max-w-2xl">
                {description}
              </p>
            </div>

            {actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {actions.map((action, index) => {
                  const variant = action.variant ?? 'primary'
                  return (
                    <Link
                      key={`${action.label}-${index}`}
                      href={action.href}
                      {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]}`}
                    >
                      {action.icon && (
                        <span className="mr-2 inline-flex items-center">
                          {action.icon}
                        </span>
                      )}
                      {action.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="relative rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm p-6 shadow-[0_20px_50px_rgba(23,22,21,0.08)]">
            <div className="absolute inset-x-6 -top-6 h-12 bg-gradient-to-tr from-[#1E1C1A] to-[#4B4036] opacity-10 blur-2xl rounded-full" />
            <div className="relative space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8A7766]">
                이미지 제안
              </h2>
              <p className="text-sm leading-relaxed text-[#3A3835]">
                {imagePrompt}
              </p>
              <p className="text-xs text-[#6F6A64]">
                고해상도 사진 또는 일러스트를 권장합니다. 이미지 선택 시
                차분한 중간톤과 자연광을 활용하면 전체 톤과 조화를 이룹니다.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

