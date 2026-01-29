/**
 * PayMongo Payment Method Attachment API
 * Handles attaching payment methods to payment intents for e-wallet payments
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodType, cardDetails } = await request.json();
    
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    // For e-wallet payments, we need to create a payment method first
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

    // Step 1: Create payment method
    let paymentMethodBody;
    
    if (paymentMethodType === 'card' && cardDetails) {
      // For card payments, include card details
      paymentMethodBody = {
        data: {
          attributes: {
            type: paymentMethodType,
            details: {
              card_number: cardDetails.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(cardDetails.expMonth),
              exp_year: parseInt(cardDetails.expYear),
              cvc: cardDetails.cvc
            },
            billing: {
              name: cardDetails.holderName || 'Test User',
              email: 'test@example.com',
              phone: '+639171234567'
            }
          }
        }
      };
    } else {
      // For e-wallet payments
      paymentMethodBody = {
        data: {
          attributes: {
            type: paymentMethodType,
            billing: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+639171234567'
            }
          }
        }
      };
    }

    const paymentMethodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentMethodBody)
    });

    const paymentMethodData = await paymentMethodResponse.json();

    if (!paymentMethodResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to create payment method',
          details: paymentMethodData 
        },
        { status: paymentMethodResponse.status }
      );
    }

    // Step 2: Attach payment method to payment intent
    const attachResponse = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodData.data.id,
            return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success`
          }
        }
      })
    });

    const attachData = await attachResponse.json();

    if (!attachResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to attach payment method',
          details: attachData 
        },
        { status: attachResponse.status }
      );
    }

    // Check if payment requires next action (redirect for e-wallet)
    const paymentIntent = attachData.data;
    
    if (paymentIntent.attributes.next_action) {
      // For e-wallet payments, redirect user to payment provider
      return NextResponse.json({
        success: true,
        requiresAction: true,
        nextAction: paymentIntent.attributes.next_action,
        paymentIntent: paymentIntent
      });
    }

    return NextResponse.json({
      success: true,
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('PayMongo attach error:', error);
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
    message: 'PayMongo payment method attachment endpoint',
    usage: 'POST with { paymentIntentId, paymentMethodType } to attach payment method'
  });
}
