// app/page.tsx
'use client'

import { useCallback } from 'react'
import Header from './components/header'
import HeroSection from './components/sections/HeroSection'
import ReviewsSection from './components/sections/ReviewsSection'
import DashboardSection from './components/sections/DashboardSection'
import MembershipsSection from './components/sections/MembershipsSection'
import Footer from './components/sections/Footer'

export default function Home() {
  // 재사용할 그라디언트
  const PETMILY_GRADIENT_OVERLAY =
  'linear-gradient(180deg, rgba(213,205,201,0.6) 15%, rgba(203,183,162,0.6) 50%, rgba(216,202,184,0.6) 90%)'

  const handlePlanSelect = useCallback((planTitle: string) => {
    console.log('Selected plan:', planTitle)
  }, [])

  const handleViewPricing = useCallback(() => {
    window.location.href = '/pricing'
  }, [])

  const handleFreeTrial = useCallback(() => {
    window.location.href = '/register'
  }, [])

  return (
    <main className='bg-[linear-gradient(180deg,#D5CDC9_15%,#CBB7A2_50%,#D8CAB8_90%)]'>
      <Header />
      
      <div className="pt-20">
        <HeroSection
          title="Companion for every chapter of your pet's life from start to end."
          subtitle="From the first cuddle to the final goodbye. Our service embraces every moment of your pet's journey with love, care, and dignity."
          buttonText="Start your free trial"
          backgroundImage="/images/tug1.png"
          gradientOverlay={PETMILY_GRADIENT_OVERLAY}
          showSocialIcons={true}
          showPetImages={true}
        />

        <DashboardSection />

        <ReviewsSection />

        <MembershipsSection
          onPlanSelect={handlePlanSelect}
          onViewPricing={handleViewPricing}
          onFreeTrial={handleFreeTrial}
        />

        <Footer />
      </div>
    </main>
  )
}
