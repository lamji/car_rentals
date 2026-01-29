/**
 * Test PayMongo API Route
 * Simple test endpoint to verify PayMongo integration
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount = 2000 } = await request.json();
    
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    // Use btoa for browser compatibility or Buffer for Node.js
    const encodedKey = typeof window !== 'undefined' 
      ? btoa(`${secretKey}:`) 
      : Buffer.from(`${secretKey}:`).toString('base64');

    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount,
            payment_method_allowed: ['gcash'],
            payment_method_options: {
              card: { request_three_d_secure: 'any' }
            },
            currency: 'PHP',
            capture_type: 'automatic',
            description: 'test payment'
          }
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'PayMongo API error',
          details: responseData 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData.data
    });

  } catch (error) {
    console.error('PayMongo test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PayMongo test endpoint',
    usage: 'POST with { amount: 2000 } to test payment intent creation'
  });
}
