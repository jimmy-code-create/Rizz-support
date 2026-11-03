import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import multer from 'multer';
import {
  ALLOWED_ATTACHMENT_TYPES,
  TICKET_LIMITS,
} from '../../shared/support.ts';
import type { AttachmentRecord } from './tickets.ts';

export class UploadValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'UploadValidationError';
    this.status = status;
  }
}

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.pdf',
  '.txt',
]);

type DetectedType = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf' | 'text/plain';

function detectFileType(buffer: Buffer): DetectedType | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  // Plain text has no magic number: require valid UTF-8 with no NUL bytes.
  if (!buffer.includes(0)) {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      return 'text/plain';
    } catch {
      return null;
    }
  }
  return null;
}

const MIME_BY_DETECTED: Record<DetectedType, string> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/webp': 'image/webp',
  'application/pdf': 'application/pdf',
  'text/plain': 'text/plain',
};

export function sanitizeFileName(original: string): string {
  const base = path.basename(original).replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, ' ').trim();
  return (base || 'attachment').slice(0, TICKET_LIMITS.attachmentName);
}

export const uploadMiddleware: RequestHandler = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TICKET_LIMITS.attachmentBytes,
    files: 1,
    fields: 20,
    fieldSize: 20_000,
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedMime = ALLOWED_ATTACHMENT_TYPES.some((entry) => entry.mime === file.mimetype);
    if (!allowedMime || !ALLOWED_EXTENSIONS.has(extension)) {
      callback(
        new UploadValidationError(
          'Attachments must be a PNG, JPEG, WebP, PDF, or plain-text file.',
          415,
        ),
      );
      return;
    }
    callback(null, true);
  },
}).single('attachment');

/**
 * Validates the file's real signature (not just its declared MIME type)
 * and writes it under a random name in the private uploads directory.
 */
export function persistAttachment(
  file: Express.Multer.File,
  uploadsDir: string,
): AttachmentRecord {
  const detected = detectFileType(file.buffer);
  if (!detected) {
    throw new UploadValidationError(
      'That file does not look like a valid PNG, JPEG, WebP, PDF, or text file.',
      415,
    );
  }
  if (detected !== file.mimetype && !(detected === 'image/jpeg' && file.mimetype === 'image/jpg')) {
    throw new UploadValidationError(
      'The file contents do not match its file type. Please upload a valid file.',
      415,
    );
  }

  const extension = path.extname(sanitizeFileName(file.originalname)).toLowerCase();
  const storedName = `${randomUUID()}${extension === '.jpeg' ? '.jpg' : extension}`;
  const storedPath = path.join(uploadsDir, storedName);
  fs.writeFileSync(storedPath, file.buffer, { mode: 0o600 });

  return {
    storedPath,
    originalName: sanitizeFileName(file.originalname),
    size: file.size,
    mime: MIME_BY_DETECTED[detected],
  };
}

export function removeStoredFile(storedPath: string): void {
  try {
    fs.unlinkSync(storedPath);
  } catch {
    /* already gone */
  }
}
