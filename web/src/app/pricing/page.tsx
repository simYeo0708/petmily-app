'use client'

import { useMemo, useState } from 'react'
import { Check, Crown, Sparkles, Star, Zap } from 'lucide-react'

import Header from '../components/header'
import Footer from '../components/sections/Footer'
import PageIntro from '../components/common/PageIntro'

type BillingCycle = 'monthly' | 'annual'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    headline: '하루 루틴을 가볍게 시작해요',
    price: { monthly: 49000, annual: 490000 },
    badge: '추천',
    gradient: 'from-[#FDF7F2] to-[#F4EEE7]',
    icon: <Star className="h-5 w-5 text-[#C59172]" />,
    benefits: [
      'AI 케어 피드 기본 제공',
      '반려동물 프로필 1마리',
      '커뮤니티 하이라이트',
      '케어 루틴 템플릿 10개',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    headline: '가족과 함께 깊이 있는 케어',
    price: { monthly: 99000, annual: 990000 },
    badge: '가장 인기',
    gradient: 'from-[#C59172]/15 to-[#F4EEE7]',
    icon: <Zap className="h-5 w-5 text-[#C59172]" />,
    benefits: [
      '반려동물 프로필 5마리',
      '실시간 워커 매칭',
      '가족 계정 공유 & 권한 설정',
      '전문가 케어 리포트 무제한',
      '우선 지원 & 전용 세션',
    ],
    highlight: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    headline: '전문 케어 팀을 위한 고급 기능',
    price: { monthly: 149000, annual: 1490000 },
    badge: '프로페셔널',
    gradient: 'from-[#1E1C1A] to-[#3B3129]',
    icon: <Crown className="h-5 w-5 text-white" />,
    benefits: [
      '반려동물 프로필 무제한',
      '맞춤 케어 플로우 빌더',
      '전문가 네트워크 알림센터',
      'API & Webhook 통합',
      '전담 성공 매니저 배정',
    ],
    dark: true,
  },
]

const addOns = [
  {
    title: 'Petmily Labs Early Access',
    description: '실험 기능을 미리 체험하고 제품 로드맵에 피드백을 남길 수 있는 프로그램.',
    price: '월 19,000원',
  },
  {
    title: '수의학 자문 패널',
    description: '파트너 수의사 네트워크와 월 1회 온라인 상담 세션을 연결합니다.',
    price: '월 59,000원',
  },
  {
    title: '데이터 내보내기 플러스',
    description: '분석-ready 포맷(CSV, JSON)과 API 로그 기록을 추가 제공합니다.',
    price: '월 29,000원',
  },
]

const faqList = [
  {
    q: '연간 결제를 선택하면 어떤 혜택이 있나요?',
    a: '연간 플랜은 두 달치 요금이 절약됩니다. 즉, 12개월 요금으로 14개월을 사용할 수 있습니다.',
  },
  {
    q: '중간에 플랜을 변경해도 되나요?',
    a: '언제든지 업그레이드 또는 다운그레이드할 수 있고, 남은 기간은 자동으로 비례 계산됩니다.',
  },
  {
    q: '스튜디오 플랜은 누구에게 적합한가요?',
    a: '반려동물 케어 서비스를 운영하거나 다수의 반려동물을 관리하는 전문가 팀에게 최적화되어 있습니다.',
  },
  {
    q: '결제 전에 체험해볼 수 있나요?',
    a: '모든 플랜은 14일 무료 체험을 제공합니다. 체험 기간 동안 언제든지 취소할 수 있습니다.',
  },
]

const numberFormatter = new Intl.NumberFormat('ko-KR')

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const billingCopy = useMemo(
    () =>
      cycle === 'monthly'
        ? { label: '월간 결제', helper: '언제든지 플랜을 변경하거나 취소할 수 있어요.' }
        : { label: '연간 결제', helper: '두 달치 요금을 절약하고, 장기 케어 플랜을 안정적으로 운영하세요.' },
    [cycle],
  )

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1E1C1A]">
      <Header />

      <PageIntro
        tagline="Pricing"
        title="반려 케어 여정에 맞는 플랜을 선택하세요"
        description="무료 체험으로 시작하고 필요에 따라 확장할 수 있습니다. 모든 플랜은 App Store와 Google Play에서 동일하게 적용됩니다."
        imagePrompt="가격표가 놓여 있는 책상, 옆에는 반려견 사진이 있는 액자와 노트북. Petmily 앱 화면에는 요금제를 선택하는 인터페이스가 보인다."
        actions={[
          { label: '14일 무료 체험 시작', href: '/register', variant: 'primary' },
          { label: '다운로드 살펴보기', href: '/downloads', variant: 'secondary' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center rounded-full border border-[#C59172]/30 bg-[#FDF7F2] px-3 py-1 text-xs font-semibold text-[#C59172]">
              <Sparkles className="mr-2 h-4 w-4" />
              14일 무료 체험 후 결제
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-2 py-2 shadow-sm">
              <button
                onClick={() => setCycle('monthly')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cycle === 'monthly'
                    ? 'bg-[#1E1C1A] text-white shadow-[0_10px_25px_rgba(30,28,26,0.25)]'
                    : 'text-[#4F4A45] hover:bg-black/5'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setCycle('annual')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cycle === 'annual'
                    ? 'bg-[#1E1C1A] text-white shadow-[0_10px_25px_rgba(30,28,26,0.25)]'
                    : 'text-[#4F4A45] hover:bg-black/5'
                }`}
              >
                연간 (2개월 무료)
              </button>
            </div>
            <p className="text-sm text-[#4F4A45]">{billingCopy.helper}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const price = plan.price[cycle]
              const isAnnual = cycle === 'annual'
              const displayPrice = numberFormatter.format(price)

              return (
                <div
                  key={plan.id}
                  className={`relative flex h-full flex-col rounded-3xl border border-black/6 bg-gradient-to-br ${plan.gradient} p-8 shadow-[0_25px_60px_rgba(38,33,30,0.12)] transition hover:-translate-y-2`}
                >
                  {plan.badge && (
                    <span
                      className={`inline-flex w-max items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        plan.dark ? 'bg-white/15 text-white' : 'bg-[#1E1C1A] text-white'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <div className="mt-6 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        plan.dark ? 'bg-white/15 text-white' : 'bg-[#C59172]/15 text-[#C59172]'
                      }`}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-semibold ${plan.dark ? 'text-white' : 'text-[#1E1C1A]'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${plan.dark ? 'text-white/70' : 'text-[#4F4A45]'}`}>{plan.headline}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className={`text-4xl font-semibold ${plan.dark ? 'text-white' : 'text-[#1E1C1A]'}`}>
                      ₩{displayPrice}
                    </span>
                    <span className={`text-sm ${plan.dark ? 'text-white/70' : 'text-[#4F4A45]'}`}>
                      / {isAnnual ? '연간' : '월간'}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.3em] ${plan.dark ? 'text-white/70' : 'text-[#C59172]'}`}>
                      2 Months Off
                    </p>
                  )}

                  <ul className="mt-8 space-y-3 text-sm">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className={`flex items-start gap-3 ${plan.dark ? 'text-white/80' : 'text-[#3A3835]'}`}>
                        <Check className={`mt-0.5 h-4 w-4 flex-none ${plan.dark ? 'text-white' : 'text-[#C59172]'}`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <a
                      href="/register"
                      className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                        plan.dark
                          ? 'bg-white text-[#1E1C1A] hover:bg-[#F4EEE7]'
                          : 'bg-[#1E1C1A] text-white hover:bg-black'
                      }`}
                    >
                      무료 체험 시작하기
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-[#1E1C1A]">Add-ons & Services</h2>
              <p className="mt-4 text-base text-[#4F4A45]">
                필요에 따라 추가 기능을 선택해 케어 운영을 확장하세요. 모든 애드온은 월 단위로 유연하게 추가/삭제할 수
                있습니다.
              </p>
            </div>
            <div className="grid gap-4">
              {addOns.map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/5 bg-gradient-to-br from-[#FDF7F2] to-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1E1C1A]">{item.title}</h3>
                      <p className="mt-2 text-sm text-[#4F4A45]">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#C59172]">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-[#1E1C1A] p-10 md:p-12 text-white">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
              <div>
                <h3 className="text-2xl font-semibold">팀 단위로 도입하고 싶다면?</h3>
                <p className="mt-3 text-sm text-white/70">
                  케어 센터, 워커 그룹, 반려 서비스 스타트업을 위한 맞춤 온보딩과 통합 지원을 제공합니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="mailto:partners@petmily.com"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1E1C1A] transition hover:bg-[#F4EEE7]"
                  >
                    세일즈 상담 신청
                  </a>
                  <a
                    href="/downloads"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1E1C1A]"
                  >
                    다운로드 안내 보기
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/75">
                <p>
                  <strong className="text-white">도입 사례 미리보기</strong>
                </p>
                <p className="mt-3">
                  “Petmily Growth 플랜 이후 산책 운영 프로세스가 40% 이상 간소화되었고, 보호자 만족도도 크게 향상됐어요.”
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/50">— Teddy Walkers, Seoul</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F5F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-[#1E1C1A]">자주 묻는 질문</h2>
          <div className="mt-10 space-y-6">
            {faqList.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_18px_40px_rgba(73,60,50,0.05)]">
                <h3 className="text-lg font-semibold text-[#1E1C1A]">{faq.q}</h3>
                <p className="mt-2 text-sm text-[#4F4A45]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#1E1C1A]">앱 다운로드 후 4분이면 세팅 완료</h2>
          <p className="mt-3 text-base text-[#4F4A45]">
            반려동물과의 하루를 더 단단하게 연결하고 싶다면 지금 Petmily 앱을 설치하세요. 무료 체험으로 기능을 직접 경험할
            수 있습니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#1E1C1A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#1E1C1A] px-6 py-3 text-sm font-semibold text-[#1E1C1A] transition hover:bg-[#1E1C1A] hover:text-white"
            >
              Google Play
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#C59172]/15 px-6 py-3 text-sm font-semibold text-[#C59172] transition hover:bg-[#C59172]/25"
            >
              무료 체험 등록
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


