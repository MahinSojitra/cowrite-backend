import { randomUUID } from 'crypto';

export function getRequestId(existing?: string): string {
  return existing && existing.length > 0 ? existing : randomUUID();
}
