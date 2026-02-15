/**
 * Edge-compatible rate limit cache using in-memory storage
 * Note: This is per-instance, not shared across edge workers
 */

let rateLimitInfo: { resetAt: number; message: string } | null = null;

/**
 * Check if currently rate limited and get remaining time
 * Returns null if not rate limited, or { remainingMs, message } if rate limited
 */
export function checkRateLimit(): { remainingMs: number; message: string } | null {
  if (!rateLimitInfo) return null;
  
  const now = Date.now();
  const remainingMs = rateLimitInfo.resetAt - now;
  
  if (remainingMs <= 0) {
    rateLimitInfo = null;
    return null;
  }
  
  return { remainingMs, message: rateLimitInfo.message };
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
