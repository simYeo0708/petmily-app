'use client'

import Image from 'next/image'
import Link from 'next/link'

interface FooterProps {
  logo?: string
  companyName?: string
  description?: string
  services?: Array<{ name: string; href: string }>
  support?: Array<{ name: string; href: string }>
  contact?: {
    email?: string
    phone?: string
    hours?: string
  }
  copyright?: string
  className?: string
}

const defaultServices = [
  { name: '앱 다운로드', href: '/downloads' },
  { name: '사용 방법', href: '/how-it-works' },
  { name: '회사 소개', href: '/about' },
]

const defaultSupport = [
  { name: '자주 묻는 질문', href: '/support' },
  { name: '가격 안내', href: '/pricing' },
  { name: '회원가입', href: '/register' },
]

const defaultContact = {
  email: 'support@petmily.com',
  phone: '1588-0000',
  hours: '평일 9:00-18:00'
}

export default function Footer({
  logo = '/icons/dog-paw.png',
  companyName = 'PetMily',
  description = '반려동물과 함께하는 행복한 일상을 만들어갑니다',
  services = defaultServices,
  support = defaultSupport,
  contact = defaultContact,
  copyright = '© 2024 PetMily. All rights reserved.',
  className = 'bg-gradient-to-r from-[#8B7355] to-[#6B5B47] text-white py-12'
}: FooterProps) {
  return (
    <footer className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="pl-4">
            <div className="flex items-center mb-4">
              <Image src={logo} alt="Petmily Logo" width={24} height={24} className="mr-2" />
              <span className="text-xl font-bold">{companyName}</span>
            </div>
            <p className="text-gray-200">
              {description}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-gray-200">
              {services.map((service, index) => (
                <li key={index}>
                  <Link href={service.href} className="hover:text-white">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2 text-gray-200">
              {support.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <p className="text-gray-200">
              이메일: {contact.email}<br />
              전화: {contact.phone}<br />
              운영시간: {contact.hours}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-200">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
