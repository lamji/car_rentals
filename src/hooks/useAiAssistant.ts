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
}

interface AiAssistantOptions {
  location?: LocationContext;
  token?: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BOOKING_INTENT_KEYWORDS = [
  'check my booking', 'check booking', 'my booking', 'my bookings',
  'booking status', 'find my booking', 'look up booking', 'track booking',
  'where is my booking', 'check reservation',
];

const LOCATION_CAR_KEYWORDS = [
  'available car near', 'available cars near', 'cars near', 'car near',
  'available car in', 'available cars in', 'cars in', 'car in',
  'available car around', 'cars around', 'car around',
  'near me', 'available near', 'available in', 'available around',
  'cars available in', 'car available in', 'cars available near', 'car available near',
  'available sedan', 'available suv', 'available van', 'available pickup',
  'available hatchback', 'available coupe', 'available sports car',
  'sedan near', 'suv near', 'van near', 'pickup near',
  'sedan in', 'suv in', 'van in', 'pickup in',
];

const CAR_TYPES = ['sedan', 'suv', 'van', 'pickup truck', 'pickup', 'sports car', 'coupe', 'hatchback'];

function isBookingIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return BOOKING_INTENT_KEYWORDS.some(kw => lower.includes(kw));
}

function isLocationCarIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return LOCATION_CAR_KEYWORDS.some(kw => lower.includes(kw));
}

// Phrases that mean "use my current GPS location" — return null so we fall back to Redux location
const MY_LOCATION_PHRASES = [
  'my location', 'my area', 'my place', 'my city', 'my address',
  'my current location', 'my current area', 'my current place',
  'here', 'where i am', 'my position',
];

function extractLocationFromMessage(message: string): string | null {
  const lower = message.toLowerCase();

  // Check if user means "my location" — return null to trigger fallback to GPS
  if (MY_LOCATION_PHRASES.some(p => lower.includes(p))) {
    return null;
  }

  // Patterns: "near <location>", "in <location>", "around <location>"
  const patterns = [
    /(?:near|in|around)\s+(.+?)(?:\?|$|,\s*(?:what|any|are|do|can))/i,
    /(?:near|in|around)\s+(.+?)$/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      // Clean up the extracted location
      let loc = match[1].trim();
      // Remove trailing question marks and common suffixes
      loc = loc.replace(/[?!.]+$/, '').trim();
      // Remove car type words from location
      CAR_TYPES.forEach(t => {
        loc = loc.replace(new RegExp(`\\b${t}\\b`, 'gi'), '').trim();
      });
      // Remove date phrases (e.g. "this coming feb 25 to 30", "from feb 25-30", "today", "tomorrow", "this weekend")
      loc = loc.replace(/\b(?:this\s+coming|from|for|on|during)\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}\s*(?:to|-|through|until|til)\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{1,2}\b/gi, '').trim();
      loc = loc.replace(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}\s*(?:to|-|through|until|til)\s*(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{1,2}\b/gi, '').trim();
      // Remove filler words
      loc = loc.replace(/\b(available|today|tomorrow|this\s+coming|this\s+weekend|this|that|the|any|some|a|an|coming|from|for|on|during)\b/gi, '').trim();
      if (loc.length > 2) return loc;
    }
  }

  return null;
}

function extractCarType(message: string): string | undefined {
  const lower = message.toLowerCase();
  for (const type of CAR_TYPES) {
    if (lower.includes(type)) return type;
  }
  return undefined;
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
  apr: '04', april: '04', may: '05', jun: '06', june: '06',
  jul: '07', july: '07', aug: '08', august: '08', sep: '09', september: '09',
  oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
};

function extractDateRange(message: string): { startDate?: string; endDate?: string } {
  const lower = message.toLowerCase();
  const currentYear = new Date().getFullYear();

  // Pattern: "feb 25 to 30", "february 25 - 28", "feb 25-30"
  const rangePattern = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\s*(?:to|-|through|until|til)\s*(\d{1,2})\b/i;
  const rangeMatch = lower.match(rangePattern);
  if (rangeMatch) {
    const month = MONTH_MAP[rangeMatch[1].toLowerCase()];
    if (month) {
      const startDay = rangeMatch[2].padStart(2, '0');
      const endDay = rangeMatch[3].padStart(2, '0');
      return {
        startDate: `${currentYear}-${month}-${startDay}`,
        endDate: `${currentYear}-${month}-${endDay}`,
      };
    }
  }

  // Pattern: "feb 25 to march 2"
  const crossMonthPattern = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\s*(?:to|-|through|until|til)\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/i;
  const crossMatch = lower.match(crossMonthPattern);
  if (crossMatch) {
    const m1 = MONTH_MAP[crossMatch[1].toLowerCase()];
    const m2 = MONTH_MAP[crossMatch[3].toLowerCase()];
    if (m1 && m2) {
      return {
        startDate: `${currentYear}-${m1}-${crossMatch[2].padStart(2, '0')}`,
        endDate: `${currentYear}-${m2}-${crossMatch[4].padStart(2, '0')}`,
      };
    }
  }

  // "today"
  if (lower.includes('today')) {
    const today = new Date().toISOString().split('T')[0];
    return { startDate: today, endDate: today };
  }

  // "tomorrow"
  if (lower.includes('tomorrow')) {
    const tmr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return { startDate: tmr, endDate: tmr };
  }

  // "this weekend" (next Sat-Sun)
  if (lower.includes('this weekend')) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToSat = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(now.getTime() + daysToSat * 86400000);
    const sun = new Date(sat.getTime() + 86400000);
    return {
      startDate: sat.toISOString().split('T')[0],
      endDate: sun.toISOString().split('T')[0],
    };
  }

  return {};
}

const CANCEL_KEYWORDS = ['cancel', 'wrong email', 'wrong', 'nevermind', 'never mind', 'go back', 'stop', 'start over', 'different email', 'change email'];

const BOOK_THIS_KEYWORDS = [
  'i want to book', 'book this', 'book that', 'book it', 'book now',
  'i\'ll book', 'ill book', 'let me book', 'proceed with booking',
  'yes book', 'yes, book', 'yes i want to book', 'reserve this',
  'reserve that', 'i\'ll take it', 'ill take it', 'i want this car',
  'i want that car', 'book the car', 'yes proceed',
  'i want to rent', 'rent this car', 'book this for me',
  'confirm booking', 'schedule rental', 'lock this car',
  'i want to confirm', 'let\'s book', 'lets book',
];

const AFFIRMATIVE_KEYWORDS = [
  'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'okey',
  'proceed', 'go ahead', 'confirm', 'alright', 'aight',
  'absolutely', 'definitely', 'of course', 'sige', 'oo', 'opo',
  'g', 'go', 'lets go', 'let\'s go', 'do it', 'i do', 'affirmative',
];

function isAffirmativeReply(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return AFFIRMATIVE_KEYWORDS.some(kw => lower === kw || lower === kw + '!' || lower === kw + '.');
}

function isBookThisCarIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return BOOK_THIS_KEYWORDS.some(kw => lower.includes(kw));
}

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

export function useAiAssistant({ location, token }: AiAssistantOptions = {}) {
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
      // Allow cancel/wrong email
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
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Please enter the **6-digit code** sent to your email (numbers only, e.g. 123456).\n\nType **"cancel"** if you entered the wrong email.' },
        ]);
        return;
      }
    }

    // Booking flow: waiting for email input
    if (bookingFlow === 'waiting_email') {
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
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'That doesn\'t look like a valid email address. Please enter a valid email (e.g. juan@gmail.com).' },
        ]);
        return;
      }
    }

    // Check if user wants to book a previously shown car
    // Triggers on: explicit booking phrases OR short affirmative replies when AI just asked "would you like to book?"
    const wantsToBook = lastShownCarsRef.current.length > 0 && (
      isBookThisCarIntent(trimmed) ||
      (awaitingBookingConfirmRef.current && isAffirmativeReply(trimmed))
    );
    if (wantsToBook) {
      awaitingBookingConfirmRef.current = false;
      const availableCar = lastShownCarsRef.current.find((c: { availableForDates?: boolean }) => c.availableForDates !== false) || lastShownCarsRef.current[0];
      const cardHtml = buildSingleCarCardHtml(availableCar);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: cardHtml, isHtml: true },
      ]);
      return;
    }
    // Reset awaiting flag if user says something else
    awaitingBookingConfirmRef.current = false;

    // Check if user wants to look up bookings
    if (isBookingIntent(trimmed)) {
      setBookingFlow('waiting_email');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sure! For security, I\'ll need to verify your identity first.\n\nPlease enter the **email address** you used when booking. I\'ll send a verification code to that email.' },
      ]);
      return;
    }

    // Check if user is asking for cars near a specific location
    if (isLocationCarIntent(trimmed)) {
      const extractedLocation = extractLocationFromMessage(trimmed);
      const carType = extractCarType(trimmed);
      const { startDate, endDate } = extractDateRange(trimmed);
      const dateInfo = startDate && endDate ? ` (${startDate} to ${endDate})` : '';

      if (extractedLocation) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Searching for ${carType ? carType + ' ' : ''}cars near **${extractedLocation}**${dateInfo}...` },
        ]);
        await lookupNearbyCars(extractedLocation, carType, startDate, endDate);
        return;
      }
      if (location?.address) {
        const locationStr = [location.city, location.province].filter(Boolean).join(', ') || location.address;
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Searching for ${carType ? carType + ' ' : ''}cars near **${locationStr}**${dateInfo}...` },
        ]);
        await lookupNearbyCars(locationStr, carType, startDate, endDate);
        return;
      }
    }

    // Normal AI chat flow
    const updatedMessages = [...messages, newUserMessage];
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
