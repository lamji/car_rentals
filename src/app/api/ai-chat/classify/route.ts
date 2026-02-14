import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Use a fast, small model for classification — cheap and quick
const CLASSIFIER_MODEL = 'llama-3.1-8b-instant';

const CLASSIFY_PROMPT = `You are an intent classifier for a car rental chatbot. Given a user message and context, classify the intent and extract entities.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{"intent":"<intent>","location":"<location or null>","carType":"<car type or null>","startDate":"<date or null>","endDate":"<date or null>"}

INTENTS (pick exactly one):
- "location_search" — user wants to FIND or SEARCH for cars near a specific place. They are asking about car availability in a geographic area. Examples: "any car near Catmon Cebu?", "recommend a car in Mandaue", "i am in Cebu, any available car?", "is there a car available new catmon cebu area?"
- "follow_up" — user is asking about a car they were ALREADY shown. Questions about price, availability on a date, self-drive, features, booked dates, unavailable dates, etc. Examples: "is that car available today?", "how much is 12 hours?", "is it self-drive?", "what about march 10?", "hmm how much is the driver fee?", "list of booked dates?", "what are the unavailable dates?", "when is it booked?", "can you give the booked dates?", "show me the booked schedule"
- "booking_lookup" — user wants to check/track THEIR OWN PERSONAL booking that they previously made. This is ONLY for when the user wants to see their own reservation details. Examples: "check my booking", "where is my booking?", "booking status", "I want to see my reservation", "track my booking". IMPORTANT: Asking about a car's booked dates or unavailable dates is NOT booking_lookup — that is "follow_up". The word "booked" alone does NOT mean booking_lookup. Only classify as booking_lookup if the user says "MY booking" or wants to check a personal reservation.
- "book_car" — user is CONFIRMING they want to proceed with booking a previously shown car. This is ONLY for short affirmative confirmations, NOT questions about availability. Examples: "yes I want to book", "book that car", "let's go", "yes", "sure proceed", "reserve it". IMPORTANT: "can I book today?" or "can I book on March 10?" are NOT book_car — those are "follow_up" because the user is asking about availability on a specific date.
- "general" — anything else: greetings, how-to questions, general info, unrelated topics. Examples: "hello", "how do I rent a car?", "what payment methods do you accept?"

LOCATION EXTRACTION:
- Extract the place name the user mentions (city, municipality, landmark, address). Clean it — remove filler words like "area", "place", "region".
- If user says "near me", "my location", "my area" → set location to "GPS"
- If no location mentioned → null
- Common typos: "new" often means "near", "nea" means "near"

CAR TYPE: Extract if mentioned (sedan, suv, van, pickup, etc.), otherwise null.
DATES: Extract if mentioned in YYYY-MM-DD format, otherwise null. "today" = current date. "this coming march 10" = 2026-03-10.

CONTEXT AWARENESS:
- If the user was previously shown car results (hasShownCars=true), questions like "is that available?", "how much?", "is it self-drive?" are "follow_up", NOT "location_search".
- "is that car available today?" when cars were already shown = "follow_up" (asking about the shown car)
- "is there a car available near Cebu?" = "location_search" (searching for new cars)
- Short affirmative replies ("yes", "sure", "ok", "go ahead") after being asked "would you like to book?" = "book_car"`;

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: false, message: 'AI service not configured' }, { status: 500 });
    }

    const { message, hasShownCars, awaitingBookingConfirm } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const userPrompt = `Today's date: ${today}
hasShownCars: ${!!hasShownCars}
awaitingBookingConfirm: ${!!awaitingBookingConfirm}

User message: "${message}"`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLASSIFIER_MODEL,
        messages: [
          { role: 'system', content: CLASSIFY_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.error('Classifier API error:', response.status);
      return NextResponse.json({ success: false, message: 'Classification failed' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';

    // Parse JSON from response — handle potential markdown wrapping
    let parsed;
    try {
      const jsonStr = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse classifier response:', raw);
      // Fallback: treat as general intent
      return NextResponse.json({
        success: true,
        intent: 'general',
        location: null,
        carType: null,
        startDate: null,
        endDate: null,
      });
    }

    return NextResponse.json({
      success: true,
      intent: parsed.intent || 'general',
      location: parsed.location || null,
      carType: parsed.carType || null,
      startDate: parsed.startDate || null,
      endDate: parsed.endDate || null,
    });
  } catch (error) {
    console.error('Classify error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
