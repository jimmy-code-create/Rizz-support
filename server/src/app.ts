import fs from 'node:fs';
import path from 'node:path';
import { createHash, timingSafeEqual } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import multer from 'multer';
import type { Database } from './db.ts';
import { openDatabase } from './db.ts';
import { createTicketStore, type TicketStore } from './tickets.ts';
import { buildRateLimiters } from './rate-limit.ts';
import {
  UploadValidationError,
  persistAttachment,
  removeStoredFile,
  uploadMiddleware,
} from './uploads.ts';
import {
  createTicketSchema,
  fieldErrors,
  lookupTicketSchema,
  updateTicketSchema,
} from './validation.ts';
import { isValidReference, normalizeReference } from './reference.ts';

export interface CreateAppOptions {
  dataDir: string;
  adminToken?: string | null;
  clientDist?: string;
  rateLimit?: boolean;
}

export interface CreatedApp {
  app: express.Express;
  database: Database;
  store: TicketStore;
  close: () => void;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function tokenMatches(provided: string, expected: string): boolean {
  return timingSafeEqual(sha256(provided), sha256(expected));
}

export function createApp(options: CreateAppOptions): CreatedApp {
  const database = openDatabase(options.dataDir);
  const store = createTicketStore(database.db);
  const limiters = buildRateLimiters(options.rateLimit !== false);
  const app = express();
  const adminToken = options.adminToken?.trim() || null;

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://rizzapp.onrender.com'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'", 'https://*.e2b.app'],
          upgradeInsecureRequests: null,
        },
      },
      crossOriginEmbedderPolicy: false,
      xFrameOptions: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(express.json({ limit: '64kb' }));
  app.use('/api', limiters.api, (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/robots.txt', (_request, response) => {
    response
      .type('text/plain')
      .send('User-agent: *\nAllow: /\nDisallow: /api/\n');
  });

  app.post(
    '/api/tickets',
    limiters.createTicket,
    uploadMiddleware,
    (request: Request, response: Response, next: NextFunction) => {
      try {
        const body = request.body as Record<string, unknown>;
        // Honeypot field: a hidden input that only automated clients fill in.
        if (typeof body.website === 'string' && body.website.trim().length > 0) {
          response.status(400).json({
            error: { code: 'INVALID_REQUEST', message: 'The request could not be accepted.' },
          });
          return;
        }

        const parsed = createTicketSchema.safeParse(body);
        if (!parsed.success) {
          response.status(422).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Please correct the highlighted fields and try again.',
              fields: fieldErrors(parsed.error),
            },
          });
          return;
        }

        const input = parsed.data;
        const duplicate = store.findDuplicate(input.email, input.subject, 10);
        if (duplicate) {
          response.status(409).json({
            error: {
              code: 'DUPLICATE_REQUEST',
              message:
                'You already submitted a request with this subject in the last 10 minutes. Track the existing request with your reference number and email.',
              reference: duplicate.reference,
            },
          });
          return;
        }

        let attachment: ReturnType<typeof persistAttachment> | undefined;
        if (request.file) {
          attachment = persistAttachment(request.file, database.uploadsDir);
        }

        try {
          const created = store.create({
            name: input.name,
            email: input.email,
            category: input.category as Parameters<typeof store.create>[0]['category'],
            subject: input.subject,
            description: input.description,
            priority: input.priority as Parameters<typeof store.create>[0]['priority'],
            browserInfo: input.browserInfo,
            attachment,
          });

          response.status(201).json({ ticket: created.ticket });
        } catch (error) {
          if (attachment) removeStoredFile(attachment.storedPath);
          throw error;
        }
      } catch (error) {
        next(error);
      }
    },
  );

  app.post('/api/tickets/lookup', limiters.lookupTicket, (request, response) => {
    const parsed = lookupTicketSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      response.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Enter a valid ticket reference and email address.',
          fields: fieldErrors(parsed.error),
        },
      });
      return;
    }

    const ticket = store.lookup(parsed.data.reference, parsed.data.email);
    if (!ticket) {
      response.status(404).json({
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'We could not find a request with that reference and email address.',
        },
      });
      return;
    }

    response.json({ ticket });
  });

  // Admin API. Completely disabled (404) unless SUPPORT_ADMIN_TOKEN is configured.
  const requireAdmin = (request: Request, response: Response, next: NextFunction) => {
    if (!adminToken) {
      response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found.' } });
      return;
    }
    const header = request.get('authorization') ?? '';
    const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!provided || !tokenMatches(provided, adminToken)) {
      response.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'A valid admin token is required.' },
      });
      return;
    }
    next();
  };

  app.patch(
    '/api/admin/tickets/:reference/status',
    limiters.admin,
    requireAdmin,
    (request, response) => {
      const reference = normalizeReference(String(request.params.reference ?? ''));
      if (!isValidReference(reference)) {
        response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found.' } });
        return;
      }

      const parsed = updateTicketSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        response.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provide a valid status and an optional message.',
            fields: fieldErrors(parsed.error),
          },
        });
        return;
      }

      const updated = store.updateStatus(
        reference,
        parsed.data.status as Parameters<typeof store.updateStatus>[1],
        parsed.data.message,
      );
      if (!updated) {
        response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found.' } });
        return;
      }
      response.json(updated);
    },
  );

  app.use('/api', (_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } });
  });

  const clientDist = options.clientDist ? path.resolve(options.clientDist) : null;
  const hasClient = Boolean(clientDist && fs.existsSync(path.join(clientDist, 'index.html')));

  if (clientDist) {
    app.use(
      express.static(clientDist, {
        index: false,
        fallthrough: true,
        setHeaders: (response, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            response.setHeader('Cache-Control', 'public, max-age=300');
          }
        },
      }),
    );
  }

  app.use((request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      next();
      return;
    }
    // Missing static files must 404, not fall back to the SPA shell.
    if (request.path.startsWith('/assets/') || path.extname(request.path)) {
      next();
      return;
    }
    if (!hasClient || !clientDist) {
      response
        .status(503)
        .type('text/plain')
        .send('The support center UI has not been built yet. Run "npm run build" first.');
      return;
    }
    response.setHeader('Cache-Control', 'no-cache');
    response.sendFile(path.join(clientDist, 'index.html'), (error) => {
      if (error) next(error);
    });
  });

  app.use((_request, response) => {
    response.status(404).type('text/plain').send('Not found');
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof UploadValidationError) {
      response.status(error.status).json({
        error: { code: 'INVALID_ATTACHMENT', message: error.message },
      });
      return;
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'That attachment is too large. The maximum size is 5 MB.'
          : 'The attachment could not be uploaded. Please try a smaller file.';
      response.status(413).json({ error: { code: 'INVALID_ATTACHMENT', message } });
      return;
    }

    if (
      error instanceof Error &&
      'type' in error &&
      (error as { type?: string }).type === 'entity.too.large'
    ) {
      response.status(413).json({
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request was too large.' },
      });
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({
        error: { code: 'INVALID_JSON', message: 'The request body was not valid JSON.' },
      });
      return;
    }

    console.error('[support-api]', error instanceof Error ? error.message : 'Unknown error');
    response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side. Please try again in a moment.',
      },
    });
  });

  return {
    app,
    database,
    store,
    close: () => database.close(),
  };
}
