import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { hasBookings: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/api/bookings?email=${encodeURIComponent(email)}&limit=1`,
      { headers }
    );

    const data = await response.json();
    const bookings = data?.data || [];

    return NextResponse.json({
      hasBookings: bookings.length > 0,
    });
  } catch (error) {
    console.error('Booking check error:', error);
    return NextResponse.json(
      { hasBookings: false, message: 'Failed to check bookings' },
      { status: 500 }
    );
  }
}
