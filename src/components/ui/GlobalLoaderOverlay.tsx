'use client'

import React from 'react'
import { useAppSelector } from '@/lib/store'

export function GlobalLoaderOverlay() {
  const { isLoading, message } = useAppSelector(state => state.globalLoader)

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center"
      data-testid="global-loader"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg shadow-lg px-6 py-5 w-[90%] max-w-sm">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <div className="text-sm font-medium text-gray-900" data-testid="global-loader-message">
            {message || 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  )
}
