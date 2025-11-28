import { Request } from "express";
import rateLimit, { RateLimitRequestHandler, ipKeyGenerator } from "express-rate-limit";


export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req: Request): string => {
    const ip = ipKeyGenerator(req as any);

    

    return ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  skipFailedRequests: false,
});
