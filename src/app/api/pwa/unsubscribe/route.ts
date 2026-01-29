import { unsubscribeUserDB } from '@/lib/npm-ready-stack/pwaService/db-actions'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/pwa/unsubscribe
 * Unsubscribe a user from push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body
    
    const result = await unsubscribeUserDB(subscriptionId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in unsubscribe API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe user' },
      { status: 500 }
    )
  }
}
