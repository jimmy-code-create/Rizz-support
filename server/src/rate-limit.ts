import { rateLimit } from 'express-rate-limit';

/**
 * Deliberately simple fixed-window limits. They protect the public form and
 * the ticket lookup endpoint without requiring a shared store.
 * For a multi-instance deployment, swap the store for Redis.
 */
export function buildRateLimiters(enabled = true) {
  const passThrough = ((_req, _res, next) => next()) as import('express').RequestHandler;

  if (!enabled) {
    return {
      api: passThrough,
      createTicket: passThrough,
      lookupTicket: passThrough,
      createIssue: passThrough,
      voteIssue: passThrough,
      admin: passThrough,
    };
  }

  const base = {
    standardHeaders: 'draft-8' as const,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false },
  };

  return {
    api: rateLimit({
      ...base,
      windowMs: 60_000,
      limit: 180,
      message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' } },
    }),
    createTicket: rateLimit({
      ...base,
      windowMs: 10 * 60_000,
      limit: 8,
      message: {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many support requests from this connection. Please try again later.',
        },
      },
    }),
    lookupTicket: rateLimit({
      ...base,
      windowMs: 10 * 60_000,
      limit: 15,
      message: {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many tracking attempts. Please wait a few minutes and try again.',
        },
      },
    }),
    createIssue: rateLimit({
      ...base,
      windowMs: 30 * 60_000,
      limit: 5,
      message: {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many public issue reports from this connection. Please try again later.',
        },
      },
    }),
    voteIssue: rateLimit({
      ...base,
      windowMs: 10 * 60_000,
      limit: 80,
      message: {
        error: { code: 'RATE_LIMITED', message: 'Too many votes. Please wait a moment and try again.' },
      },
    }),
    admin: rateLimit({
      ...base,
      windowMs: 15 * 60_000,
      limit: 60,
      message: { error: { code: 'RATE_LIMITED', message: 'Too many admin requests.' } },
    }),
  };
}
