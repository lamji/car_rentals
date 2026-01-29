import { sendNotificationDB } from '@/lib/pwaService/db-actions'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/pwa/send-notification
 * Send a push notification to a specific user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, subscriptionId } = body
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const result = await sendNotificationDB(message, subscriptionId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in send notification API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
