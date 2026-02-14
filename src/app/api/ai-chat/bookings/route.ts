import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface BookingDetail {
  firstName?: string;
  lastName?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  pickupType?: string;
  totalPrice?: number;
  pricingType?: string;
}

interface SelectedCar {
  name?: string;
  type?: string;
  image?: string;
  transmission?: string;
  seats?: number;
  year?: number;
}

interface BookingData {
  bookingId?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
  bookingDetails?: BookingDetail;
  selectedCar?: SelectedCar;
}

function formatBookingsHtml(bookings: BookingData[], email: string): string {
  if (!bookings || bookings.length === 0) {
    return `<div style="text-align:center;padding:12px;">
      <p style="font-size:13px;color:#6b7280;">No bookings found for <strong>${email}</strong></p>
      <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Please check the email address and try again.</p>
    </div>`;
  }

  const cards = bookings.map((b) => {
    const details = b.bookingDetails || {};
    const car = b.selectedCar || {};
    const statusColor = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      active: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
    }[b.bookingStatus || 'pending'] || '#6b7280';

    const paymentColor = {
      pending: '#f59e0b',
      paid: '#10b981',
      failed: '#ef4444',
      refunded: '#8b5cf6',
      cancelled: '#6b7280',
    }[b.paymentStatus || 'pending'] || '#6b7280';

    const startDate = details.startDate
      ? new Date(details.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';
    const endDate = details.endDate
      ? new Date(details.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';

    return `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:8px;background:#fff;">
      ${car.image ? `<img src="${car.image}" alt="${car.name || 'Car'}" style="width:100%;height:120px;object-fit:cover;" />` : ''}
      <div style="padding:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <strong style="font-size:13px;color:#111827;">${car.name || 'Unknown Car'}</strong>
          <span style="font-size:10px;color:#6b7280;">${car.year || ''} ${car.type || ''}</span>
        </div>
        <div style="font-size:10px;color:#6b7280;margin-bottom:6px;">ID: ${b.bookingId || 'N/A'}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;background:${statusColor}20;color:${statusColor};font-weight:600;">${b.bookingStatus || 'pending'}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;background:${paymentColor}20;color:${paymentColor};font-weight:600;">Payment: ${b.paymentStatus || 'pending'}</span>
        </div>
        <div style="font-size:11px;color:#374151;line-height:1.6;">
          <div><strong>Date:</strong> ${startDate} - ${endDate}</div>
          <div><strong>Time:</strong> ${details.startTime || ''} - ${details.endTime || ''}</div>
          <div><strong>Pickup:</strong> ${details.pickupType || 'N/A'}</div>
          <div><strong>Total:</strong> P${details.totalPrice?.toLocaleString() || '0'}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div>
    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Found <strong>${bookings.length}</strong> booking${bookings.length > 1 ? 's' : ''} for <strong>${email}</strong></div>
    ${cards}
  </div>`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, token, sessionToken } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Require a valid AI session token (from OTP verification)
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Verification required to access booking data' },
        { status: 403 }
      );
    }

    // Validate session token with backend
    const sessionRes = await fetch(`${API_URL}/api/ai/verify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, email }),
    });
    const sessionData = await sessionRes.json();

    if (!sessionRes.ok || !sessionData.valid) {
      return NextResponse.json(
        { success: false, message: 'Session expired or invalid. Please verify your email again.' },
        { status: 403 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/api/bookings?email=${encodeURIComponent(email)}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json({
        success: true,
        html: formatBookingsHtml([], email),
      });
    }

    const html = formatBookingsHtml(data.data || [], email);

    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('Booking lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to look up bookings' },
      { status: 500 }
    );
  }
}
