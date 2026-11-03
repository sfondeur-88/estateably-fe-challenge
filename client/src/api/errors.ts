import type { ApiErrorBody } from './types.ts';

type ServerErrorCode = ApiErrorBody['error']['code'];

/** Failures that never reach the API's error envelope. */
type ClientErrorCode = 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE';

export type ApiErrorCode = ServerErrorCode | ClientErrorCode;

export type ApiErrorDetail = NonNullable<
  ApiErrorBody['error']['details']
>[number];

/** Every failed request throws this, so callers branch on `code`, not on `status`. */
export class ApiError extends Error {
  override name = 'ApiError';
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: ApiErrorDetail[];

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details: ApiErrorDetail[] = [],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }
  const { error } = value;
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}
