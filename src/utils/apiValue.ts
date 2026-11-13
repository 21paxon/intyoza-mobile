export function recordValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function collectionFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = recordValue(value);
  if (!record) return [];
  const arrays = Object.values(record).filter(Array.isArray) as unknown[][];
  return arrays.length === 1 ? arrays[0] : [];
}

export function readableValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean).join(', ');
  const record = recordValue(value);
  if (!record) return '';
  const strings = Object.values(record).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  return strings[0] ?? JSON.stringify(value);
}

export function apiMessage(error: unknown): string {
  const candidate = error as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return (
    candidate?.response?.data?.error?.message ??
    candidate?.response?.data?.message ??
    candidate?.message ??
    'Something went wrong. Please try again.'
  );
}
