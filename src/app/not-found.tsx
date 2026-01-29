'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
 
export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage immediately
    router.push('/')
  }, [router])

  // Return null or loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}