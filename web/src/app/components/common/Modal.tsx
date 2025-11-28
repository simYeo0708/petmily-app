'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  title: string
  message: string
  buttonText?: string
  onButtonClick?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function Modal({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = '확인',
  onButtonClick,
  autoClose = false,
  autoCloseDelay = 3000
}: ModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {type === 'success' ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className={`text-xl font-bold mb-2 ${
            type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {title}
          </h3>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* Button */}
          <button
            onClick={handleButtonClick}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              type === 'success'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
