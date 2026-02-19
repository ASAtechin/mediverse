/**
 * Simple in-memory rate limiter for Next.js API routes.
 * For production at scale, replace with Redis-backed (e.g. @upstash/ratelimit).
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of rateLimitMap.entries()) {
            if (now > value.resetAt) {
                rateLimitMap.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export function rateLimit(options: {
    windowMs?: number;
    maxRequests?: number;
} = {}) {
    const { windowMs = 15 * 60 * 1000, maxRequests = 10 } = options;

    return {
        /**
         * Check if a request should be rate-limited.
         * @param key - Unique identifier (e.g. IP address, phone number)
         * @returns { limited: boolean, remaining: number, resetAt: number }
         */
        check(key: string): { limited: boolean; remaining: number; resetAt: number } {
            const now = Date.now();
            const record = rateLimitMap.get(key);

            if (!record || now > record.resetAt) {
                // New window
                rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
                return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
            }

            record.count++;
            if (record.count > maxRequests) {
                return { limited: true, remaining: 0, resetAt: record.resetAt };
            }

            return { limited: false, remaining: maxRequests - record.count, resetAt: record.resetAt };
        },
    };
}

// Pre-configured rate limiter for auth endpoints
export const authRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 });
