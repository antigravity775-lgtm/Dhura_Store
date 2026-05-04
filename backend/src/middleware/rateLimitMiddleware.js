const rateLimit = require('express-rate-limit');
const PrismaStore = require('./prismaRateLimitStore');

const authLimiter = rateLimit({
  store: new PrismaStore({ windowMs: 15 * 60 * 1000 }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 failed attempts per 15 minutes
  skipSuccessfulRequests: true, // Only count failed attempts (4xx/5xx)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const resetMs = req.rateLimit?.resetTime
      ? req.rateLimit.resetTime - Date.now()
      : 15 * 60 * 1000;
    const minutesLeft = Math.max(1, Math.ceil(resetMs / 1000 / 60));
    res.status(429).json({
      message: `لقد تجاوزت الحد المسموح به من المحاولات. يرجى المحاولة مرة أخرى بعد ${minutesLeft} دقيقة.`
    });
  }
});

module.exports = { authLimiter };
