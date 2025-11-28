'use client'

import { CalendarHeart, HandHeart, ShieldCheck, Sparkles, Users } from 'lucide-react'

import Header from '../components/header'
import Footer from '../components/sections/Footer'

const keyPoints = [
  '회원가입 시 입력한 반려동물 정보 기반 AI 맞춤 상품 추천',
  '신원 확인 및 경력 검증을 거친 전문 산책 워커 네트워크',
  '실시간 위치 공유와 채팅 기능으로 안전한 산책 서비스',
  '원스톱 반려동물 케어 플랫폼',
  '검증된 워커와 편리한 상품 구매를 하나의 앱에서',
]

const promiseCards = [
  {
    title: 'Personalized Care',
    description: '반려동물의 개별 정보를 바탕으로 AI가 맞춤 상품을 추천하고, 개인화된 케어 경험을 제공합니다.',
    icon: <HandHeart className="h-6 w-6 text-[#CE8C84]" />,
  },
  {
    title: 'Trusted Walkers',
    description: '신원 확인과 경력 검증을 거친 전문 산책 워커만을 엄선하여 안전하고 믿을 수 있는 서비스를 제공합니다.',
    icon: <ShieldCheck className="h-6 w-6 text-[#CE8C84]" />,
  },
  {
    title: 'AI-Powered Recommendations',
    description: '반려동물 정보를 활용한 AI 기반 상품 추천 시스템으로 더 정확하고 개인화된 추천을 제공합니다.',
    icon: <Sparkles className="h-6 w-6 text-[#CE8C84]" />,
  },
]

const cultureHighlights = [
  {
    title: 'AI 기술과 서비스 전문성',
    description: 'AI 엔지니어와 서비스 디자이너가 함께 반려동물 정보 기반 맞춤 추천 시스템을 개발하고 개선합니다.',
    icon: <Users className="h-6 w-6 text-[#2E2A27]" />,
  },
  {
    title: '검증된 워커 네트워크',
    description: '전문 산책 워커와의 안전한 매칭 시스템을 통해 믿을 수 있는 반려동물 케어 생태계를 구축합니다.',
    icon: <CalendarHeart className="h-6 w-6 text-[#2E2A27]" />,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBF7F4] text-[#2E2A27]">
      <Header />
      <main className="pt-28 pb-20">
        <section
          className="relative overflow-hidden text-white"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(19,19,19,0.35) 8%, rgba(19,19,19,0.7) 100%), url("/images/tug1.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <nav className="text-sm text-white/70 mb-6">
              <span className="mr-2 text-white/50">Home</span>
              <span className="mr-2 text-white/40">/</span>
              <span>About</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(0,1fr)] items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm text-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
                  Dedicated to your pet family
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
                    반려동물 정보로 시작하는 <span className="text-[#FFD4C6]">맞춤 케어</span>
                  </h1>
                  <p className="text-base sm:text-lg text-white/85 max-w-2xl">
                    Petmily는 회원가입 시 입력한 반려동물 정보를 바탕으로 AI가 맞춤 상품을 추천하고, 검증된 워커와 안전한 산책 서비스를 제공합니다. 
                    반려동물의 종, 나이, 성격 등 개인 정보를 활용해 더 나은 케어 경험을 만들어갑니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://apps.apple.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-[#2E2A27] transition hover:bg-white"
                  >
                    App Store에서 만나보기
                  </a>
                  <a
                    href="/downloads"
                    className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    다운로드 안내 보기
                  </a>
                </div>
              </div>

              <aside className="rounded-3xl border border-white/25 bg-white/15 p-6 shadow-[0_35px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">컨셉 이미지</p>
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  보호자가 스마트폰으로 Petmily 앱을 보며 반려동물 정보를 입력하는 장면. 옆에는 반려견이 앉아 있고, 화면에는 AI 추천 상품 목록과 산책 워커 예약 화면이 보인다. 자연광이 들어오는 거실 배경.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_1fr] items-center rounded-3xl bg-white p-10 shadow-[0_35px_80px_rgba(82,62,52,0.08)] border border-[#E8D9D3]">
            <div className="rounded-3xl border border-[#E8D9D3] bg-[#F8EFEB] p-6 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B0867B]">스토리 이미지</p>
              <p className="mt-3 text-sm text-[#66574E] leading-relaxed">
                Petmily 팀이 반려동물 정보 기반 AI 추천 시스템을 개발하는 과정을 보여주는 모습. 화이트보드에는 반려동물 정보 입력 프로세스와 상품 추천 알고리즘 설계가 그려져 있고, 옆에는 검증된 산책 워커 매칭 시스템 다이어그램이 있는 장면.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-[#2E2A27]">Why Choose Petmily?</h2>
              <p className="text-sm text-[#5E544D] leading-relaxed">
                반려동물 케어에 필요한 상품 구매와 산책 서비스가 각각 분리되어 있다는 불편함에서 Petmily는 출발했습니다. 
                회원가입 시 입력한 반려동물 정보를 바탕으로 AI가 맞춤 상품을 추천하고, 검증된 산책 워커와 안전하게 연결될 수 있도록 
                원스톱 서비스를 제공합니다.
              </p>
              <div className="grid gap-3">
                {keyPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-[#4F453F]">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#B86F64]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">Petmily가 지키는 세 가지 약속</h2>
                <p className="mt-3 text-sm text-[#5F5650]">
                  기술을 넘어, 반려 생활의 감정과 연결을 이해하는 팀이 되기 위한 우리의 핵심 가치입니다.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-[#E8D9D3] px-4 py-2 text-xs font-semibold text-[#B86F64] uppercase tracking-[0.3em]">
                since 2022
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {promiseCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#E8D9D3] bg-gradient-to-br from-[#FFF9F6] to-[#F4EBE7] p-8 shadow-[0_25px_60px_rgba(78,54,45,0.06)]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4D9D4]">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm text-[#5F5650] leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#2E2A27] bg-[#2E2A27] text-white p-10 shadow-[0_35px_80px_rgba(20,15,12,0.25)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold">사람과 문화</h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  다양한 배경의 동료들이 매일 실험하고 배우며 반려 생활의 문제를 해결합니다. 사용자 인터뷰, 데이터 분석,
                  커뮤니티 운영을 통해 더 나은 경험을 함께 설계합니다.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                TEAM PETMILY
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {cultureHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/80 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/15 bg-white/10 p-6">
              <div>
                <h3 className="text-xl font-semibold">Petmily와 새로운 여정을 만들고 싶으신가요?</h3>
                <p className="mt-2 text-sm text-white/80">제품, 디자인, 데이터, 커뮤니티 등 다양한 포지션에서 채용 중입니다.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:people@petmily.com"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2E2A27] transition hover:bg-[#F4EBE7]"
                >
                  인재 영입 문의
                </a>
                <a
                  href="https://apps.apple.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#2E2A27]"
                >
                  앱 만나보기
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


