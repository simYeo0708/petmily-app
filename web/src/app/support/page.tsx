"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, Mail, Phone, MessageCircle } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/sections/Footer";

const faqs = [
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
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background with Blur */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/tug1.png")',
          filter: 'blur(8px)',
          transform: 'scale(1.1)', // Prevent blur edges
        }}
      />
      
      {/* Content with backdrop */}
      <div className="relative z-10 min-h-screen">
        <Header />

        {/* Spacing */}
        <div className="pt-24 md:pt-28"></div>
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#D8CAB8]/80 to-[#D5CDC9]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 drop-shadow-lg">
              고객 지원
            </h1>
            <p className="text-lg sm:text-xl text-gray-800 mb-6 md:mb-8 max-w-2xl mx-auto px-4 drop-shadow-md">
              궁금한 점이 있으시면 언제든지 문의해주세요. 
              빠르고 친절한 지원을 제공해드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="자주 묻는 질문 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            자주 묻는 질문
          </h2>
          
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
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

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-[#D5CDC9]/80 to-[#D8CAB8]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              문의하기
            </h2>
            <p className="text-xl text-gray-600">
              추가적인 도움이 필요하시면 언제든지 연락해주세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                이메일 문의
              </h3>
              <p className="text-gray-600 mb-4">
                24시간 내에 답변드립니다
              </p>
              <a
                href="mailto:support@petmily.com"
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                support@petmily.com
              </a>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                전화 문의
              </h3>
              <p className="text-gray-600 mb-4">
                평일 9:00-18:00
              </p>
              <a
                href="tel:1588-0000"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                1588-0000
              </a>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                실시간 채팅
              </h3>
              <p className="text-gray-600 mb-4">
                평일 9:00-18:00
              </p>
              <button className="text-green-500 hover:text-green-600 font-medium">
                채팅 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Topics Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              도움말 주제
            </h2>
            <p className="text-xl text-gray-600">
              원하는 주제를 선택하여 자세한 정보를 확인하세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/help/account"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                계정 관리
              </h3>
              <p className="text-gray-600 text-sm">
                회원가입, 로그인, 비밀번호 변경 등
              </p>
            </Link>
            
            <Link
              href="/help/orders"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                주문 및 배송
              </h3>
              <p className="text-gray-600 text-sm">
                주문 확인, 배송 추적, 환불 등
              </p>
            </Link>
            
            <Link
              href="/help/walker"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                산책 서비스
              </h3>
              <p className="text-gray-600 text-sm">
                예약, 취소, 결제, 후기 등
              </p>
            </Link>
            
            <Link
              href="/help/payment"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                결제 및 환불
              </h3>
              <p className="text-gray-600 text-sm">
                결제 방법, 환불 정책, 영수증 등
              </p>
            </Link>
            
            <Link
              href="/help/technical"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                기술 지원
              </h3>
              <p className="text-gray-600 text-sm">
                앱 사용법, 오류 해결, 업데이트 등
              </p>
            </Link>
            
            <Link
              href="/help/privacy"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                개인정보 및 보안
              </h3>
              <p className="text-gray-600 text-sm">
                개인정보 보호, 계정 보안 등
              </p>
            </Link>
          </div>
        </div>
      </section>

        <Footer />
      </div>
    </div>
  );
}
