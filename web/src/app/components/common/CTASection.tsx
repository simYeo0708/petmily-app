'use client'

interface CTAButton {
  text: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

interface CTASectionProps {
  title: string
  subtitle?: string
  buttons: CTAButton[]
  backgroundGradient?: string
  className?: string
}

export default function CTASection({
  title,
  subtitle,
  buttons,
  backgroundGradient = 'from-[#C59172] to-[#B07A5C]',
  className = ''
}: CTASectionProps) {
  const renderButton = (button: CTAButton, index: number) => {
    const baseClasses = "px-8 py-3 rounded-lg font-medium text-lg transition"
    
    if (button.variant === 'secondary') {
      return (
        <button
          key={index}
          className={`${baseClasses} bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#C59172] ${button.className || ''}`}
          onClick={button.onClick}
        >
          {button.text}
        </button>
      )
    }

    return (
      <button
        key={index}
        className={`${baseClasses} bg-white text-[#C59172] hover:bg-gray-100 ${button.className || ''}`}
        onClick={button.onClick}
      >
        {button.text}
      </button>
    )
  }

  return (
    <section className={`py-12 md:py-20 bg-gradient-to-r ${backgroundGradient} backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button, index) => renderButton(button, index))}
        </div>
      </div>
    </section>
  )
}
