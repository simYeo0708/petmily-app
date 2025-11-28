'use client'

import Header from '../header'

interface CommonLayoutProps {
  children: React.ReactNode
  showHeroSection?: boolean
  heroTitle?: string
  heroSubtitle?: string
  heroBackgroundImage?: string
}

export default function CommonLayout({ 
  children, 
  showHeroSection = false,
  heroTitle,
  heroSubtitle,
  heroBackgroundImage = "/images/tug1.png"
}: CommonLayoutProps) {
  // 이미지 위에 얹을 오버레이(투명)
  const PETMILY_GRADIENT_OVERLAY =
  'linear-gradient(180deg, rgba(213,205,201,0.6) 15%, rgba(203,183,162,0.6) 50%, rgba(216,202,184,0.6) 90%)'

  return (
    <main className='bg-[linear-gradient(180deg,#D5CDC9_15%,#CBB7A2_50%,#D8CAB8_90%)] min-h-screen'>
      {showHeroSection && (
        <section className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-center text-white" style={{
          backgroundImage: `${PETMILY_GRADIENT_OVERLAY}, url("${heroBackgroundImage}")`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}>
          <div className="absolute inset-0" style={{backgroundColor: 'rgba(30, 30, 30, 0.27)'}}/>
          <Header />
          <div className="relative z-10 max-w-4xl px-6 my-5">
            {heroTitle && (
              <h1 className="text-4xl md:text-5xl leading-snug font-semibold" style={{fontFamily: 'Italiana, serif'}}>
                {heroTitle}
              </h1>
            )}
            {heroSubtitle && (
              <p className="mt-4 md:text-base text-gray-200" style={{fontFamily:'Italiana, serif', fontSize:'22px'}}>
                {heroSubtitle}
              </p>
            )}
          </div>
        </section>
      )}
      
      {!showHeroSection && <Header />}
      
      <div className={showHeroSection ? '' : 'pt-24 md:pt-28'}>
        {children}
      </div>
    </main>
  )
}
