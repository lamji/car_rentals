/**
 * AI Knowledge Base — stores Q&A pairs from conversations in MongoDB.
 * Shared across all users so the AI "learns" from past interactions.
 * You can manually curate/correct entries via the backend API or directly in MongoDB.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// In-memory cache for rules prompt with invalidation support
let rulesCache: { prompt: string; timestamp: number } | null = null;
const RULES_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Invalidate the rules cache (called when Socket.IO notifies of rule changes)
 */
export function invalidateRulesCache() {
  rulesCache = null;
  console.log('🔄 AI rules cache invalidated');
}

interface KBEntry {
  question: string;
  answer: string;
  relevance?: number;
  isVerified?: boolean;
}

/**
 * Save a Q&A pair to the knowledge base (MongoDB).
 * Deduplication and source tracking handled by the backend.
 */
export async function saveQAPair(question: string, answer: string) {
  try {
    // Skip very short questions
    if (question.trim().length < 5) return;

    // Skip error messages
    if (answer.includes('Sorry, I encountered an error') || answer.includes('something went wrong')) return;

    await fetch(`${API_URL}/api/ai/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    });
  } catch (err) {
    // Non-blocking — don't let KB save failures break the chat
    console.error('Failed to save to AI knowledge base:', err);
  }
}

/**
 * Save a correction as a verified, manually-curated knowledge entry.
 * These entries are protected from being overwritten by AI conversations.
 */
export async function saveCorrection(question: string, correctedAnswer: string, category?: string) {
  try {
    if (question.trim().length < 5 || correctedAnswer.trim().length < 5) return;

    await fetch(`${API_URL}/api/ai/knowledge/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        answer: correctedAnswer,
        category: category || 'general',
      }),
    });
  } catch (err) {
    console.error('Failed to save correction to AI knowledge base:', err);
  }
}

/**
 * Fetch all active rules from the DB, formatted for the system prompt.
 * Cached in Redis on the backend for speed.
 * Also uses client-side in-memory cache with TTL.
 */
export async function fetchRulesForPrompt(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/ai/rules/prompt`, { cache: 'no-store' });
    if (!res.ok) return '';
    const { success, prompt } = await res.json();
    if (!success || !prompt) return '';
    return prompt;
  } catch (err) {
    console.error('Failed to fetch AI rules:', err);
    return '';
  }
}

/**
 * Create a new rule via the backend API (used by training mode).
 */
export async function createRule(title: string, content: string, category?: string) {
  try {
    const res = await fetch(`${API_URL}/api/ai/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category: category || 'general', source: 'training' }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create AI rule:', err);
    return { success: false };
  }
}

/**
 * Update an existing rule by rule number (used by training mode).
 */
export async function updateRuleByNumber(ruleNumber: number, content: string, title?: string) {
  try {
    const body: Record<string, unknown> = { content };
    if (title) body.title = title;
    const res = await fetch(`${API_URL}/api/ai/rules/by-number/${ruleNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update AI rule:', err);
    return { success: false };
  }
}

/**
 * Search the knowledge base for Q&A pairs relevant to the current question.
 * Returns the top matching pairs as formatted context string for the system prompt.
 */
export async function searchRelevantKnowledge(question: string): Promise<string> {
  try {
    if (question.trim().length < 3) return '';

    const res = await fetch(
      `${API_URL}/api/ai/knowledge/search?q=${encodeURIComponent(question)}&limit=5`
    );

    if (!res.ok) return '';

    const { success, data } = await res.json();
    if (!success || !data || data.length === 0) return '';

    const entries = data as KBEntry[];

    let context = '\n\n=== LEARNED KNOWLEDGE (from previous conversations) ===';
    context += '\nThese are verified answers from past conversations. Use them as reference but always prioritize the car data above if there is a conflict.';
    context += '\nEntries marked [VERIFIED] have been manually confirmed as correct — trust these over unverified ones.';
    entries.forEach((entry: KBEntry, i: number) => {
      const verified = entry.isVerified ? ' [VERIFIED]' : '';
      const relevance = entry.relevance ? ` (relevance: ${(entry.relevance * 100).toFixed(0)}%)` : '';
      context += `\n\n[Knowledge ${i + 1}]${verified}${relevance}`;
      context += `\n  Q: ${entry.question}`;
      context += `\n  A: ${entry.answer}`;
    });
    context += '\n=== END LEARNED KNOWLEDGE ===';

    return context;
  } catch (err) {
    // Non-blocking — don't let KB search failures break the chat
    console.error('Failed to search AI knowledge base:', err);
    return '';
  }
}
