'use client'

import Image from 'next/image'
import { Apple, ArrowRight, Play } from 'lucide-react'

import Header from '../components/header'
import Footer from '../components/sections/Footer'

const partnerLogos = [
  { name: 'Samsung', src: '/images/partners/samsung_logo.png', alt: 'Samsung' },
  { name: 'SK Hynix', src: '/images/partners/hynix_logo.png', alt: 'SK Hynix' },
  { name: 'Kakao', src: '/images/partners/kakao_logo.png', alt: 'Kakao' },
  { name: 'Naver', src: '/images/partners/naver_logo.png', alt: 'Naver' },
  { name: 'Coupang', src: '/images/partners/coupang_logo.png', alt: 'Coupang' },
  { name: 'Baemin', src: '/images/partners/baemin_logo.jpg', alt: 'Baemin' },
]

export default function DownloadsPage() {
  return (
    <div className="h-full bg-[#15192F] text-[#1F1F1F]">
      <Header />
      <main className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 right-0 w-[42%] bg-[#FFE9E0]" />
          <div className="absolute -top-40 right-10 h-60 w-60 rounded-full bg-[#FFD3C1] blur-3xl opacity-70" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#F7F1FF] blur-3xl opacity-60" />
        </div>

        <section className="min-h-screen relative z-10 max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-1 mb-[-150px] flex items-center">
          <div className="grid gap-20 lg:grid-cols-2 items-center w-full">
            <div className="space-y-8 lg:pr-12">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#222] px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#222]">
                  Premium Quality Service
                </span>
                <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#141414]">
                  Manage every moment of your pet family with one <span className="text-[#D86C47]">Petmily</span> app.
                </h1>
              </div>

              <p className="text-base sm:text-lg text-[#4E4E4E] max-w-2xl">
                반려동물의 케어 루틴, 산책 기록, 쇼핑까지 모두 하나의 앱에 담았습니다. 어디서든 Petmily를 설치하고 반려가족의 하루를 더 깊이 살펴보세요.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://apps.apple.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F1F1F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Apple className="h-5 w-5" />
                  Download for iOS
                </a>
                <a
                  href="https://play.google.com/store/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#1F1F1F] px-6 py-3 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#1F1F1F] hover:text-white"
                >
                  <Play className="h-5 w-5" />
                  Download for Android
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[#D86C47] transition hover:text-[#b65533]"
                >
                  요금제 살펴보기
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-2xl border border-[#E7E7E7] bg-white/80 p-5 shadow-[0_25px_70px_rgba(33,33,33,0.08)] backdrop-blur-sm">
                <p className="text-sm text-[#393939]">
                  <strong className="text-[#141414]">이미지 제안</strong> · 짙은 남색 배경 위에 Petmily 메인 화면이 보이는
                  스마트폰을 손으로 들고 있는 사진. 오른쪽에는 배경 일러스트가 부드럽게 배치된 장면.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9C9C9C]">SIGN UP</p>
                <p className="text-sm text-[#424242]">독점 프로모션과 기능 업데이트 소식을 이메일로 받아보세요.</p>
              </div>
            </div>

            {/* 모바일 디바이스 이미지 영역 */}
            <div className="flex justify-center lg:justify-end">
              <div className="flex items-end gap-6 md:gap-10 lg:gap-14">
                <div className="overflow-hidden rounded-[32px] backdrop-blur-sm">
                  <Image
                    src="/images/devices/my_order_list.png"
                    alt="Petmily order list"
                    width={480}
                    height={860}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[36px] backdrop-blur-sm">
                  <Image
                    src="/images/devices/map_device.png"
                    alt="Petmily map view"
                    width={760}
                    height={820}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 파트너 로고 섹션 */}
        <section className="relative z-10 max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pb-40">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9F9F9F] text-center py-3">
              TRUSTED BY TEAMS
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
              {partnerLogos.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center justify-center transition-opacity duration-300"
                  style={{ maxHeight: '48px' }}
                >
                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    width={200}
                    height={100}
                    className="h-auto w-auto object-contain"
                    style={{ maxHeight: '48px', width: 'auto' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


