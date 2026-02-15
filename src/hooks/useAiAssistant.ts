import { useState, useCallback, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isHtml?: boolean;
}

interface LocationContext {
  address: string | null;
  city?: string;
  province?: string;
  barangay?: string;
}

interface AiAssistantOptions {
  location?: LocationContext;
  token?: string | null;
  onCarsFound?: (rawCars: Record<string, unknown>[]) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// AI-powered intent classifier — replaces all keyword matching
interface ClassifyResult {
  intent: 'location_search' | 'follow_up' | 'booking_lookup' | 'book_car' | 'general';
  location: string | null;
  carType: string | null;
  startDate: string | null;
  endDate: string | null;
}

async function classifyIntent(message: string, hasShownCars: boolean, awaitingBookingConfirm: boolean): Promise<ClassifyResult> {
  try {
    const response = await fetch('/api/ai-chat/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, hasShownCars, awaitingBookingConfirm }),
    });
    const data = await response.json();
    if (data.success) {
      return {
        intent: data.intent || 'general',
        location: data.location || null,
        carType: data.carType || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };
    }
  } catch (err) {
    console.error('Intent classification failed:', err);
  }
  // Fallback: treat as general
  return { intent: 'general', location: null, carType: null, startDate: null, endDate: null };
}

const CANCEL_KEYWORDS = ['cancel', 'wrong email', 'wrong', 'nevermind', 'never mind', 'go back', 'stop', 'start over', 'different email', 'change email'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSingleCarCardHtml(car: any): string {
  const carId = car.id || car._id || '';
  const imgUrl = car.imageUrls?.[0] || car.image || '';
  const price12 = Number(car.pricePer12Hours || 0).toLocaleString();
  const price24 = Number(car.pricePer24Hours || 0).toLocaleString();
  const selfDriveLabel = car.selfDrive ? 'Self-drive' : 'With driver';

  return `<div>
    <div style="font-size:12px;color:#374151;margin-bottom:8px;">Here's the car you'd like to book:</div>
    <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;">
      ${imgUrl ? `<img src="${imgUrl}" alt="${car.name || 'Car'}" style="width:100%;height:120px;object-fit:cover;" />` : ''}
      <div style="padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <strong style="font-size:14px;color:#111827;">${car.name || 'Unknown'} ${car.year || ''}</strong>
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;background:#dbeafe;color:#2563eb;font-weight:600;">${car.distanceText || ''}</span>
        </div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">${car.type || ''} | ${car.seats || ''} seats | ${car.transmission || ''} | ${car.fuel || ''} | ${selfDriveLabel}</div>
        <div style="font-size:12px;color:#374151;margin-bottom:4px;">
          <span style="font-weight:600;">P${price12}</span> /12hr | <span style="font-weight:600;">P${price24}</span> /24hr
        </div>
        <div style="font-size:10px;color:#6b7280;margin-bottom:10px;">${car.garageAddress || ''} (${car.garageCity || ''})</div>
        <a href="/cars/${carId}" style="display:block;text-align:center;padding:10px 0;background:#2563eb;color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;">Book Now</a>
      </div>
    </div>
  </div>`;
}

function isCancelIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return CANCEL_KEYWORDS.some(kw => lower.includes(kw));
}

type BookingFlowState = 'idle' | 'waiting_email' | 'sending_otp' | 'waiting_otp' | 'verifying_otp';

const OTP_REGEX = /^\d{6}$/;

const SECURITY_BLOCK_KEYWORDS = [
  'show all bookings', 'list all bookings', 'all bookings', 'all users',
  'show all users', 'list all users', 'all customers', 'show all customers',
  'database', 'dump data', 'export data', 'all emails', 'show all emails',
  'admin access', 'admin panel', 'bypass', 'override security',
  'show someone', 'someone else', 'other people', 'other users',
  'all records', 'every booking', 'everyone', 'all accounts',
];

function isSecurityThreat(message: string): boolean {
  const lower = message.toLowerCase();
  return SECURITY_BLOCK_KEYWORDS.some(kw => lower.includes(kw));
}

export function useAiAssistant({ location, token, onCarsFound }: AiAssistantOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingFlow, setBookingFlow] = useState<BookingFlowState>('idle');
  const bookingEmailRef = useRef<string>('');
  const sessionTokenRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastShownCarsRef = useRef<any[]>([]);
  const lastSearchLocationRef = useRef<string>('');
  const awaitingBookingConfirmRef = useRef<boolean>(false);

  const waitingForEmail = bookingFlow === 'waiting_email';

  const onCarsFoundRef = useRef(onCarsFound);
  onCarsFoundRef.current = onCarsFound;

  const lookupNearbyCars = useCallback(async (locationStr: string, carType?: string, startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-chat/nearby-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationStr, carType, startDate, endDate }),
      });
      const data = await response.json();
      if (data.success && data.html) {
        // Store car data for follow-up questions
        if (data.carsContext) {
          lastShownCarsRef.current = data.carsContext;
          lastSearchLocationRef.current = locationStr;
        }
        // Merge raw car data into Redux so /cars/[id] page can find them
        if (data.rawCars && onCarsFoundRef.current) {
          onCarsFoundRef.current(data.rawCars);
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.html, isHtml: true }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Sorry, I couldn't find cars near "${locationStr}". Please try a more specific location.` },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong while searching for nearby cars.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkEmailAndSendOtp = useCallback(async (email: string) => {
    setBookingFlow('sending_otp');
    setIsLoading(true);
    try {
      // Step 1: Check if email has any bookings first
      const checkRes = await fetch('/api/ai-chat/bookings/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const checkData = await checkRes.json();

      if (!checkData.hasBookings) {
        setBookingFlow('idle');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `No bookings found for **${email}**. Please check the email address and try again, or say **"check my booking"** to start over.` },
        ]);
        setIsLoading(false);
        return;
      }

      // Step 2: Email has bookings — send OTP
      const response = await fetch('/api/ai-chat/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        bookingEmailRef.current = email;
        setBookingFlow('waiting_otp');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `I've sent a **6-digit verification code** to **${email}**. Please check your inbox and enter the code here.\n\nThe code expires in 10 minutes. Type **"cancel"** to start over.` },
        ]);
      } else {
        setBookingFlow('idle');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.message || 'Failed to send verification code. Please try again.' },
        ]);
      }
    } catch {
      setBookingFlow('idle');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const verifyOtpAndFetchBookings = useCallback(async (otp: string) => {
    const email = bookingEmailRef.current;
    setBookingFlow('verifying_otp');
    setIsLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await fetch('/api/ai-chat/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        // Failed verification — stay in waiting_otp state for retry
        setBookingFlow('waiting_otp');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: verifyData.message || 'Invalid verification code. Please try again.' },
        ]);
        setIsLoading(false);
        return;
      }

      // Step 2: OTP verified — use session token to fetch bookings
      sessionTokenRef.current = verifyData.sessionToken;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Verified! Fetching your bookings...' },
      ]);

      const bookingRes = await fetch('/api/ai-chat/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, sessionToken: verifyData.sessionToken }),
      });
      const bookingData = await bookingRes.json();

      if (bookingData.success && bookingData.html) {
        setMessages(prev => [...prev, { role: 'assistant', content: bookingData.html, isHtml: true }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: bookingData.message || 'Sorry, I could not retrieve your bookings.' },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong while verifying your code.' },
      ]);
    } finally {
      setBookingFlow('idle');
      bookingEmailRef.current = '';
      setIsLoading(false);
    }
  }, [token]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const trimmed = userMessage.trim();
    const newUserMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, newUserMessage]);

    // Security check: block data-fishing attempts
    if (isSecurityThreat(trimmed)) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'For privacy and security reasons, I can only help you access **your own** booking data. I cannot show bookings for other users or provide bulk data.\n\nIf you\'d like to check your booking, just say **"check my booking"** and I\'ll guide you through the verification process.' },
      ]);
      return;
    }

    // Booking flow: waiting for OTP input
    if (bookingFlow === 'waiting_otp') {
      if (isCancelIntent(trimmed)) {
        setBookingFlow('idle');
        bookingEmailRef.current = '';
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'No problem! The verification has been cancelled. Say **"check my booking"** whenever you\'d like to try again.' },
        ]);
        return;
      }
      const cleanedOtp = trimmed.replace(/\s/g, '');
      if (OTP_REGEX.test(cleanedOtp)) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Verifying your code...' },
        ]);
        await verifyOtpAndFetchBookings(cleanedOtp);
        return;
      }
      // Not a valid OTP and not cancel — user likely changed their mind.
      // Auto-cancel booking flow and let the message fall through to intent classification.
      setBookingFlow('idle');
      bookingEmailRef.current = '';
    }

    // Check if user is in sudo login flow (don't intercept with booking flow)
    const isSudoLoginFlow = messages.some(m => 
      m.role === 'assistant' && (
        m.content.includes('sudo login') ||
        m.content.includes('email address** to begin sudo') ||
        m.content.includes('provide your **password**')
      )
    );

    // Booking flow: waiting for email input (skip if in sudo login flow)
    if (bookingFlow === 'waiting_email' && !isSudoLoginFlow) {
      if (isCancelIntent(trimmed)) {
        setBookingFlow('idle');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Cancelled. How can I help you?' },
        ]);
        return;
      }
      if (EMAIL_REGEX.test(trimmed)) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Checking bookings for **${trimmed}**...` },
        ]);
        await checkEmailAndSendOtp(trimmed);
        return;
      }
      // Not a valid email and not cancel — user likely changed their mind.
      // Auto-cancel booking flow and let the message fall through to intent classification.
      setBookingFlow('idle');
    }

    // AI-powered intent classification — understands what the user means, not just keywords
    setIsLoading(true);
    const classified = await classifyIntent(
      trimmed,
      lastShownCarsRef.current.length > 0,
      awaitingBookingConfirmRef.current,
    );

    // --- BOOK CAR intent ---
    // Only show booking card for pure confirmations. If the message mentions a date
    // (e.g. "can I book today?", "book on March 10"), treat as follow_up so the AI
    // checks availability first.
    const hasDateRef = classified.startDate || /today|tomorrow|tonight|this week|next week|\d{1,2}\/\d|march|april|may|june|july|august|september|october|november|december|january|february/i.test(trimmed);
    if (classified.intent === 'book_car' && lastShownCarsRef.current.length > 0 && !hasDateRef) {
      awaitingBookingConfirmRef.current = false;
      const availableCar = lastShownCarsRef.current.find((c: { availableForDates?: boolean }) => c.availableForDates !== false) || lastShownCarsRef.current[0];
      const cardHtml = buildSingleCarCardHtml(availableCar);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: cardHtml, isHtml: true },
      ]);
      setIsLoading(false);
      return;
    }
    awaitingBookingConfirmRef.current = false;

    // --- BOOKING LOOKUP intent ---
    // Safety guard: only enter email flow if user is clearly asking about THEIR personal booking.
    // "booked dates" / "unavailable dates" about a car should NOT trigger this.
    if (classified.intent === 'booking_lookup') {
      const personalBookingPattern = /\b(my booking|my reservation|check booking|booking status|track booking|where.?s my|find my booking)\b/i;
      if (personalBookingPattern.test(trimmed)) {
        setBookingFlow('waiting_email');
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sure! For security, I\'ll need to verify your identity first.\n\nPlease enter the **email address** you used when booking. I\'ll send a verification code to that email.' },
        ]);
        setIsLoading(false);
        return;
      }
      // Not a personal booking query — fall through to AI chat as follow_up
    }

    // --- LOCATION SEARCH intent ---
    if (classified.intent === 'location_search') {
      const extractedLocation = classified.location;
      const carType = classified.carType || undefined;
      const startDate = classified.startDate || undefined;
      const endDate = classified.endDate || undefined;
      const dateInfo = startDate && endDate ? ` (${startDate} to ${endDate})` : '';

      if (extractedLocation && extractedLocation !== 'GPS') {
        // Single-word locations are ambiguous in the Philippines
        const locationWords = extractedLocation.trim().split(/[\s,]+/).filter((w: string) => w.length > 1);
        if (locationWords.length === 1) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `"**${extractedLocation}**" exists in multiple provinces. Could you specify which one?\n\nFor example: **"${extractedLocation}, Cebu"** or **"${extractedLocation}, Bulacan"**` },
          ]);
          setIsLoading(false);
          return;
        }

        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Searching for ${carType ? carType + ' ' : ''}cars near **${extractedLocation}**${dateInfo}...` },
        ]);
        await lookupNearbyCars(extractedLocation, carType, startDate, endDate);
        setIsLoading(false);
        return;
      }

      // "GPS" or null location — use device GPS
      if (extractedLocation === 'GPS' && location?.address) {
        // Use barangay+city+province for geocoding (most accurate for nearby garage search)
        // If structured fields are empty (GPS only sets address string), parse from address
        let barangay = location.barangay || '';
        let city = location.city || '';
        let province = location.province || '';
        
        if (!city && !province && location.address) {
          // Parse "Street, Barangay, City, Province, Country" format
          const parts = location.address.split(',').map(p => p.trim()).filter(Boolean);
          // Typical Philippine address: [street, barangay, city, province, Philippines]
          if (parts.length >= 3) {
            const hasCountry = parts[parts.length - 1].toLowerCase().includes('philippines');
            const meaningful = hasCountry ? parts.slice(0, -1) : parts;
            // Last part = province, second to last = city, third to last = barangay
            province = meaningful[meaningful.length - 1] || '';
            city = meaningful[meaningful.length - 2] || '';
            barangay = meaningful.length >= 3 ? meaningful[meaningful.length - 3] : '';
          }
        }
        
        const geocodeStr = [barangay, city, province].filter(Boolean).join(', ');
        const displayStr = location.address;
        const searchStr = geocodeStr || location.address;
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Searching for ${carType ? carType + ' ' : ''}cars near **${displayStr}**${dateInfo}...` },
        ]);
        await lookupNearbyCars(searchStr, carType, startDate, endDate);
        setIsLoading(false);
        return;
      }

      // No location extracted and no GPS
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I\'d love to help you find a car! Could you tell me the **location** you\'re looking for?\n\nFor example: **"cars near Catmon, Cebu"** or **"available car in Mandaue, Cebu"**' },
      ]);
      setIsLoading(false);
      return;
    }

    // --- FOLLOW UP and GENERAL intents → send to AI chat ---
    const updatedMessages = [...messages, newUserMessage];

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: updatedMessages.filter(m => !m.isHtml),
          location,
          lastShownCars: lastShownCarsRef.current.length > 0 ? lastShownCarsRef.current : undefined,
          lastSearchLocation: lastSearchLocationRef.current || undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, isHtml: !!data.isHtml }]);
        
        // Handle special actions
        if (data.action) {
          switch (data.action) {
            case 'logout':
              // Clear localStorage token and get new guest token
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Trigger guest token refresh
              fetch('/api/auth/guest-token', { method: 'POST' })
                .then(res => res.json())
                .then(({ token, guestId }) => {
                  localStorage.setItem('token', token);
                  localStorage.setItem('guestId', guestId);
                })
                .catch(console.error);
              break;
              
            case 'sudo_login_request_email':
            case 'sudo_login_request_password':
              // Clear booking flow state to prevent OTP interception
              setBookingFlow('idle');
              bookingEmailRef.current = '';
              break;
              
            case 'sudo_login_success':
              // Store admin token and user info
              if (data.data?.token) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
              }
              break;
          }
        }
        
        // Detect if AI is asking user to confirm booking
        const replyLower = (data.reply as string).toLowerCase();
        const bookingPromptPhrases = ['would you like to book', 'want to book', 'like to book it', 'want to reserve', 'like to reserve', 'shall i book', 'ready to book'];
        if (lastShownCarsRef.current.length > 0 && bookingPromptPhrases.some(p => replyLower.includes(p))) {
          awaitingBookingConfirmRef.current = true;
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, bookingFlow, location, lookupNearbyCars, checkEmailAndSendOtp, verifyOtpAndFetchBookings]);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
    setBookingFlow('idle');
    bookingEmailRef.current = '';
    sessionTokenRef.current = '';
    lastShownCarsRef.current = [];
    lastSearchLocationRef.current = '';
    awaitingBookingConfirmRef.current = false;
  }, []);

  const waitingForOtp = bookingFlow === 'waiting_otp';

  return { messages, isLoading, sendMessage, clearChat, waitingForEmail, waitingForOtp };
}
