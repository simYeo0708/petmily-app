'use client'

import Image from 'next/image'
import { Button } from '@headlessui/react'
import ImageBox from '../common/snsbox'

interface HeroSectionProps {
  title: string
  subtitle: string
  buttonText: string
  backgroundImage?: string
  gradientOverlay?: string
  showSocialIcons?: boolean
  showPetImages?: boolean
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  backgroundImage,
  gradientOverlay,
  showSocialIcons = false,
  showPetImages = false
}: HeroSectionProps) {
  return (
    <section 
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-center text-white" 
      style={{
        backgroundImage: backgroundImage ? `${gradientOverlay}, url("${backgroundImage}")` : undefined,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}
    >
      <div className="absolute inset-0" style={{backgroundColor: 'rgba(30, 30, 30, 0.27)'}}/>
      
      <div className="z-10 py-1 mt-16 flex items-center justify-around border-none bg-white rounded-xl hover:cursor-pointer" style={{fontFamily:'Inter, sans-serif'}}>
        <Image src="/icons/Award.png" alt="Petmily " className='p-1 ml-2' width={20} height={20} />
        <p className='text-xs text-black px-3 ml-[-2px]'>Instant Invoicing</p>
      </div>
      
      <div className="relative z-10 max-w-4xl px-4 sm:px-6 my-5">
        <h1 className="text-3xl sm:text-4xl md:text-5xl leading-snug font-semibold" style={{fontFamily: 'Italiana, serif'}}>
          {title}
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 px-4" style={{fontFamily:'Italiana, serif'}}>
          {subtitle}
        </p>
        <Button className="mt-6 bg-[#C59172] hover:bg-[#b07a5c] hover:cursor-pointer text-white font-bold py-3 px-6 rounded-full transition text-sm sm:text-base">
          {buttonText}
        </Button>

        {showSocialIcons && (
          <>
            <ImageBox name='facebook' angle={-10} x={-100} y={-30} size={78.85}/>
            <ImageBox name='tiktok' angle={12} x={-300} y={315} size={75}/>
            <ImageBox name='instagram' angle={12} x={100} y={675} size={75}/>
            <ImageBox name='linkedin' angle={12} x={1266} y={50} size={75}/>
            <ImageBox name='twitter' angle={-15} x={1130} y={288} size={60}/>
            <ImageBox name='youtube'angle={12} x={1187} y={570} size={79}/>
          </>
        )}
        
        {showPetImages && (
          <div className="mt-20 mb-5 ml-[-6rem] flex justify-around gap-30">
            {[1, 2, 3].map((num) => (
              <Image
                key={num}
                src={`/images/pet${num}.png`}
                alt={`pet${num}`}
                width={260}
                height={260}
                className="rounded-lg object-cover hover:scale-[1.15] transition-all duration-300 cursor-pointer"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
