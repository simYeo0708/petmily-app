'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  subtitle?: string
  faqs?: FAQ[]
  className?: string
  searchable?: boolean
}

const defaultFAQs: FAQ[] = [
  {
    question: "PetMily는 어떤 서비스를 제공하나요?",
    answer: "PetMily는 AI 기반 상품 추천 쇼핑몰과 신뢰할 수 있는 산책 도우미 서비스를 제공합니다. 반려동물의 특성에 맞는 맞춤형 상품을 추천하고, 검증된 산책 도우미와 함께 안전한 산책을 즐길 수 있습니다."
  },
  {
    question: "산책 도우미는 어떻게 신청하나요?",
    answer: "Find Walker 페이지에서 원하는 날짜와 시간을 선택하고, 근처의 산책 도우미를 찾아 예약할 수 있습니다. 정기 산책 패키지도 이용 가능합니다."
  },
  {
    question: "AI 상품 추천은 어떻게 작동하나요?",
    answer: "반려동물의 종, 나이, 성격 등의 정보를 바탕으로 AI가 최적의 상품을 추천합니다. 또한 의상 착용 예시도 AI로 미리 확인할 수 있습니다."
  },
  {
    question: "결제는 어떻게 하나요?",
    answer: "신용카드, 체크카드, 계좌이체 등 다양한 결제 방법을 지원합니다. 모든 결제는 안전한 보안 시스템을 통해 처리됩니다."
  },
  {
    question: "산책 도우미의 안전성은 어떻게 보장되나요?",
    answer: "모든 산책 도우미는 신원 확인, 경력 검증, 교육 과정을 거쳐 선발됩니다. 또한 실시간 위치 공유와 채팅 기능으로 안전을 모니터링합니다."
  },
  {
    question: "환불 정책은 어떻게 되나요?",
    answer: "상품의 경우 배송 전까지, 산책 서비스의 경우 예약 시간 24시간 전까지 무료 취소가 가능합니다. 자세한 내용은 이용약관을 참고해주세요."
  }
]

export default function FAQSection({
  title = "자주 묻는 질문",
  subtitle = "궁금한 점이 있으시면 언제든지 문의해주세요",
  faqs = defaultFAQs,
  className = '',
  searchable = true
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className={`py-12 md:py-20 bg-gradient-to-br from-[#D8CAB8] to-[#CBB7A2] backdrop-blur-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 drop-shadow-lg">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-800 max-w-2xl mx-auto px-4 drop-shadow-md">
            {subtitle}
          </p>
        </div>

        {searchable && (
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="질문을 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C59172] focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
