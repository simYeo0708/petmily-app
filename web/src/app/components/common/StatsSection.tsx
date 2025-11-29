'use client'

interface Stat {
  number: string
  label: string
}

interface StatsSectionProps {
  stats: Stat[]
  title?: string
  subtitle?: string
  backgroundGradient?: string
  className?: string
}

export default function StatsSection({
  stats,
  title,
  subtitle,
  backgroundGradient = 'from-[#D5CDC9] to-[#D8CAB8]',
  className = ''
}: StatsSectionProps) {
  return (
    <section className={`py-12 md:py-20 bg-gradient-to-br ${backgroundGradient} backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 drop-shadow-lg">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg sm:text-xl text-gray-800 max-w-2xl mx-auto px-4 drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 drop-shadow-lg">
                {stat.number}
              </div>
              <div className="text-gray-800 font-medium drop-shadow-md">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
