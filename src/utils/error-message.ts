import { ApiError } from '../api/types';

export function errorMessage(cause: unknown, fallback = 'Could not save.'): string {
  if (cause instanceof ApiError) {
    return cause.message;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return fallback;
}
