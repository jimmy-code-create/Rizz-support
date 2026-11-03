import type {
  ApiErrorBody,
  CreateTicketResponse,
  LookupTicketResponse,
} from '@shared/ticket';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;
  readonly reference: string | null;

  constructor(
    message: string,
    options: {
      status: number;
      code: string;
      fields?: Record<string, string>;
      reference?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields ?? {};
    this.reference = options.reference ?? null;
  }
}

const TIMEOUT_MS = 20_000;

async function readError(response: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> | null = null;
  try {
    body = (await response.json()) as Partial<ApiErrorBody>;
  } catch {
    body = null;
  }
  return new ApiError(body?.error?.message || 'The request could not be completed.', {
    status: response.status,
    code: body?.error?.code || 'REQUEST_FAILED',
    fields: body?.error?.fields ?? {},
    reference: body?.error?.reference,
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    throw new ApiError(
      timedOut
        ? 'The request took too long. Check your connection and try again.'
        : 'We could not reach the support service. Check your connection and try again.',
      { status: 0, code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR' },
    );
  }

  if (!response.ok) throw await readError(response);

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('The support service returned an unexpected response.', {
      status: response.status,
      code: 'BAD_RESPONSE',
    });
  }
}

export function submitSupportRequest(form: FormData): Promise<CreateTicketResponse> {
  return request<CreateTicketResponse>('/api/tickets', {
    method: 'POST',
    body: form,
  });
}

export function lookupSupportTicket(reference: string, email: string): Promise<LookupTicketResponse> {
  return request<LookupTicketResponse>('/api/tickets/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, email }),
  });
}
