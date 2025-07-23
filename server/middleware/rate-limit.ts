import { Request, Response, NextFunction } from 'express';

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

interface RateLimitOptions {
  windowMs: number;    // Time window in milliseconds
  max: number;         // Maximum number of requests in the time window
  message?: any;       // Error message to send when rate limit is exceeded
}

interface RateLimitClient {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 * For production use, consider using Redis or a dedicated package like express-rate-limit
 */
export function rateLimit(options: RateLimitOptions) {
  const clients = new Map<string, RateLimitClient>();
  const { windowMs, max, message = 'Too many requests, please try again later' } = options;

  // Clean up expired entries periodically
  const cleanup = setInterval(() => {
    const now = Date.now();
    // Use Array.from to convert the Map entries to an array
    Array.from(clients.entries()).forEach(([key, client]) => {
      if (now > client.resetTime) {
        clients.delete(key);
      }
    });
  }, windowMs);

  // Ensure cleanup doesn't prevent the process from exiting
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP or user ID if authenticated
    const key = req.user?.id || req.ip || 'unknown';
    const now = Date.now();

    // Get or create client rate limit data
    let client = clients.get(key);
    if (!client || now > client.resetTime) {
      client = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment request count
    client.count++;

    // Store updated client data
    clients.set(key, client);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - client.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(client.resetTime / 1000).toString());

    // If limit is exceeded, send error response
    if (client.count > max) {
      return res.status(429).json(message);
    }

    next();
  };
} 