// Rate limiting middleware
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

export const rateLimit = (windowMs = RATE_LIMIT_WINDOW, maxRequests = RATE_LIMIT_MAX_REQUESTS) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    requestCounts.set(key, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requestCounts.set(key, validRequests);
    next();
  };
};

// Stricter rate limit for auth endpoints
export const authRateLimit = rateLimit(15 * 60 * 1000, 10);
