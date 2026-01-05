// In-memory rate limiter for Edge Functions
// Note: This works per isolate, so limits are approximate but provide good protection

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60000; // 1 minute

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number; // seconds until reset
}

/**
 * Check if a request is within rate limits
 * @param key Unique key for rate limiting (e.g., "reset:ip:192.168.1.1" or "reset:email:user@example.com")
 * @param maxRequests Maximum number of requests allowed in the window
 * @param windowSeconds Time window in seconds
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const record = requestCounts.get(key);
  
  // Clean expired entry for this key
  if (record && now > record.resetAt) {
    requestCounts.delete(key);
  }
  
  const existingRecord = requestCounts.get(key);
  
  if (!existingRecord) {
    // First request in window
    const resetAt = now + (windowSeconds * 1000);
    requestCounts.set(key, { count: 1, resetAt });
    return { 
      allowed: true, 
      remaining: maxRequests - 1, 
      resetAt,
      retryAfter: 0
    };
  }
  
  if (existingRecord.count >= maxRequests) {
    // Limit exceeded
    const retryAfter = Math.ceil((existingRecord.resetAt - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0, 
      resetAt: existingRecord.resetAt,
      retryAfter: Math.max(1, retryAfter)
    };
  }
  
  // Increment counter
  existingRecord.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - existingRecord.count, 
    resetAt: existingRecord.resetAt,
    retryAfter: 0
  };
}

/**
 * Get client IP from request headers
 * Handles various proxy headers
 */
export function getClientIP(req: Request): string {
  // Try various headers in order of preference
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  return 'unknown';
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(
  retryAfter: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Too many requests. Please try again later.',
      retryAfter
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        ...corsHeaders
      }
    }
  );
}
