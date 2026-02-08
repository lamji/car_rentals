/**
 * GCash Payment Intent API Route
 * Creates payment intents specifically for GCash payments in car rental bookings
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'PHP',
      description,
      metadata = {},
      statement_descriptor = 'CAR RENTAL'
    } = await request.json();
    
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Use Buffer for Node.js server-side
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

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
            amount: Math.round(amount * 100), // Convert to cents
            payment_method_allowed: ['gcash'],
            currency,
            capture_type: 'automatic',
            description: description || `Car rental payment - ${new Date().toISOString().split('T')[0]}`,
            statement_descriptor,
            metadata: {
              ...metadata,
              source: 'car_rental_app',
              payment_method: 'gcash',
              created_at: new Date().toISOString()
            }
          }
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('PayMongo API Error:', responseData);
      return NextResponse.json(
        { 
          error: 'PayMongo API error',
          details: responseData,
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: responseData.data.id,
        amount: responseData.data.attributes.amount,
        currency: responseData.data.attributes.currency,
        status: responseData.data.attributes.status,
        client_key: responseData.data.attributes.client_key,
        description: responseData.data.attributes.description,
        statement_descriptor: responseData.data.attributes.statement_descriptor,
        metadata: responseData.data.attributes.metadata,
        created_at: responseData.data.attributes.created_at,
        updated_at: responseData.data.attributes.updated_at
      }
    });

  } catch (error) {
    console.error('GCash Payment Intent Error:', error);
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
    message: 'GCash Payment Intent API',
    usage: 'POST with { amount: 333.40, description: "Car rental - Toyota Fortuner", metadata: {...} }',
    example: {
      amount: 333.40,
      currency: 'PHP',
      description: 'Car rental - Toyota Fortuner (2026-02-08 to 2026-02-08)',
      statement_descriptor: 'CAR RENTAL',
      metadata: {
        booking_id: '2026-02-08_2026-02-08_fortuner-2020',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        car_name: 'Toyota Fortuner',
        rental_dates: '2026-02-08 to 2026-02-08'
      }
    }
  });
}