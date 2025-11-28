'use client'

import { SAMPLE_WALKER_REVIEWS } from '@/data/sampleData'
import { Star } from 'lucide-react'

export default function ReviewsSection() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold mb-4 md:mb-6 text-center text-gray-900">워커 리뷰</h2>
        <p className="text-center text-gray-600 mb-8 md:mb-12">
          실제 사용자들이 남긴 솔직한 리뷰를 확인해보세요
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_WALKER_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Header with Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <div className="text-xs text-gray-500">{formatDate(review.reviewDate)}</div>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{review.comment}</p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#C59172] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {review.reviewerName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{review.reviewerName}</div>
                  <div className="text-xs text-gray-500">
                    {review.petName}의 보호자 · {review.walkerName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
