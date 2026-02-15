import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.rate-limit-cache.json');

interface RateLimitInfo {
  resetAt: number; // Unix timestamp in milliseconds
  message: string;
}

/**
 * Store rate limit reset time
 */
export function setRateLimit(resetInSeconds: number, message: string): void {
  const resetAt = Date.now() + (resetInSeconds * 1000);
  const data: RateLimitInfo = { resetAt, message };
  
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write rate limit cache:', err);
  }
}

/**
 * Check if currently rate limited and get remaining time
 * Returns null if not rate limited, or { remainingMs, message } if rate limited
 */
export function checkRateLimit(): { remainingMs: number; message: string } | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }

    const content = fs.readFileSync(CACHE_FILE, 'utf-8');
    const data: RateLimitInfo = JSON.parse(content);
    
    const now = Date.now();
    const remainingMs = data.resetAt - now;
    
    if (remainingMs <= 0) {
      // Rate limit expired, delete cache file
      fs.unlinkSync(CACHE_FILE);
      return null;
    }
    
    return { remainingMs, message: data.message };
  } catch (err) {
    console.error('Failed to read rate limit cache:', err);
    return null;
  }
}

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse Groq rate limit error message to extract reset time
 * Example: "Requested 5299. Please try again in 1h15m55.008s."
 */
export function parseGroqRateLimitError(errorMessage: string): number | null {
  // Match patterns like "1h15m55s" or "15m30s" or "45s"
  const match = errorMessage.match(/try again in (\d+h)?(\d+m)?(\d+(?:\.\d+)?s)/i);
  if (!match) return null;
  
  let totalSeconds = 0;
  
  // Parse hours
  if (match[1]) {
    const hours = parseInt(match[1].replace('h', ''));
    totalSeconds += hours * 3600;
  }
  
  // Parse minutes
  if (match[2]) {
    const minutes = parseInt(match[2].replace('m', ''));
    totalSeconds += minutes * 60;
  }
  
  // Parse seconds
  if (match[3]) {
    const seconds = parseFloat(match[3].replace('s', ''));
    totalSeconds += seconds;
  }
  
  return Math.ceil(totalSeconds);
}
