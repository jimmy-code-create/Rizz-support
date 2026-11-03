import { randomInt } from 'node:crypto';
import { TICKET_REFERENCE_PATTERN } from '../../shared/support.ts';

/** Crockford-style alphabet: no I, L, O, or U, so refs are unambiguous when read aloud. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

export function generateReference(): string {
  let body = '';
  for (let index = 0; index < 6; index += 1) {
    body += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return `RZ-${body}`;
}

export function normalizeReference(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidReference(value: string): boolean {
  return TICKET_REFERENCE_PATTERN.test(value);
}
