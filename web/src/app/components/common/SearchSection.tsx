'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

interface SearchOption {
  value: string
  label: string
}

interface SearchSectionProps {
  placeholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSearch?: () => void
  filterOptions?: SearchOption[]
  selectedFilter?: string
  onFilterChange?: (value: string) => void
  className?: string
}

export default function SearchSection({
  placeholder = "검색어를 입력하세요",
  searchValue,
  onSearchChange,
  onSearch,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  className = ''
}: SearchSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.()
  }

  return (
    <div className={`max-w-2xl mx-auto px-4 ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C59172] focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {filterOptions.length > 0 && onFilterChange && (
          <select
            value={selectedFilter || ''}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C59172] focus:border-transparent"
          >
            <option value="">모든 카테고리</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        <button
          type="submit"
          className="bg-[#C59172] hover:bg-[#B07A5C] text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center"
        >
          <Search className="h-4 w-4 mr-2" />
          검색
        </button>
      </form>
    </div>
  )
}
