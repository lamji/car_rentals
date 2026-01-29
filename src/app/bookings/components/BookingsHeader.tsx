'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'

/**
 * Bookings page header component with back button and title
 * @returns {JSX.Element} Header component with navigation
 */
export function BookingsHeader() {
  const router = useRouter()
  
  return (
    <div data-id="bookings-header" className="bg-white shadow-sm sticky top-0 z-10">
      <div data-id="bookings-header-container" className="px-4 py-4 sm:px-6 sm:py-6">
        <div data-id="bookings-header-content" className="flex items-center space-x-4">
          <Button
            data-id="bookings-back-button"
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        
        </div>
      </div>
    </div>
  )
}
