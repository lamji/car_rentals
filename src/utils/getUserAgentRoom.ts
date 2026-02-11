/**
 * Generates a unique room name from userAgent string.
 * Must match the backend hashing logic in utils/holdCountdown.js
 */
export function getUserAgentRoom(userAgent: string): string {
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hold:${Math.abs(hash).toString(36)}`;
}
