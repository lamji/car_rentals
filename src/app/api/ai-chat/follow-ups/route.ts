import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimitCacheEdge';

export const runtime = 'edge';

/**
 * Generate contextual follow-up questions based on conversation
 * POST /api/ai-chat/follow-ups
 */
export async function POST(request: NextRequest) {
  try {
    const { userQuery, aiResponse } = await request.json();

    if (!userQuery || !aiResponse) {
      return NextResponse.json(
        { success: false, message: 'Missing userQuery or aiResponse' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit();
    if (rateLimitCheck) {
      // Return empty follow-ups during rate limit
      return NextResponse.json({ success: true, followUps: [] });
    }

    // Don't generate follow-ups for sudo login/logout flows
    if (
      aiResponse.includes('sudo login') ||
      aiResponse.includes('provide your **password**') ||
      aiResponse.includes('Sudo login successful') ||
      aiResponse.includes('Logging out')
    ) {
      return NextResponse.json({ success: true, followUps: [] });
    }

    const prompt = `You are a car rental assistant. Based on the user's last question and your response, generate 2 short, contextual follow-up questions the user might want to ask next.

User asked: "${userQuery}"
Your response: "${aiResponse.substring(0, 200)}..."

Generate exactly 2 follow-up questions that:
- Are directly related to the conversation context
- Help the user continue their car rental journey
- Are concise (max 8 words each)
- Sound natural and conversational

Return ONLY a JSON array of 2 strings, nothing else.
Example: ["What are the rental rates?", "Do you offer insurance?"]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim() || '';

    // Parse JSON array from response
    let followUps: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        followUps = parsed.slice(0, 2);
      }
    } catch {
      // Fallback: extract questions from text
      const lines = content.split('\n').filter((l: string) => l.trim());
      followUps = lines
        .map((l: string) => l.replace(/^[-*\d.)\]]+\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter((q: string) => q.length > 0)
        .slice(0, 2);
    }

    // Final fallback
    if (followUps.length < 2) {
      followUps = ['Tell me more', 'What else should I know?'];
    }

    return NextResponse.json({ success: true, followUps });
  } catch (error) {
    console.error('Follow-ups generation error:', error);
    return NextResponse.json(
      { success: false, followUps: ['Tell me more', 'What else?'] },
      { status: 200 } // Return 200 with fallback questions
    );
  }
}
