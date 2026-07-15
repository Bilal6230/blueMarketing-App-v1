type LoggerMetadata = Record<string, unknown>;

const sensitiveFragments = [
  'password',
  'authorization',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'api_key',
  'nic',
  'cnic',
  'phone',
  'address',
  'old_values',
  'new_values',
] as const;

export function sanitizeMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadata(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>(
      (result, [key, nestedValue]) => {
        if (isSensitiveKey(key)) {
          result[key] = '[REDACTED]';
          return result;
        }

        result[key] = sanitizeMetadata(nestedValue);
        return result;
      },
      {},
    );
  }

  return value;
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  return sensitiveFragments.some((fragment) =>
    normalizedKey.includes(fragment),
  );
}

function write(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  metadata?: LoggerMetadata,
) {
  if (!__DEV__) {
    return;
  }

  const sanitized = metadata ? sanitizeMetadata(metadata) : undefined;

  if (level === 'debug' || level === 'info') {
    console.warn(`[${level}] ${message}`, sanitized);
    return;
  }

  if (level === 'warn') {
    console.warn(`[${level}] ${message}`, sanitized);
    return;
  }

  console.error(`[${level}] ${message}`, sanitized);
}

export const logger = {
  debug: (message: string, metadata?: LoggerMetadata) =>
    write('debug', message, metadata),
  info: (message: string, metadata?: LoggerMetadata) =>
    write('info', message, metadata),
  warn: (message: string, metadata?: LoggerMetadata) =>
    write('warn', message, metadata),
  error: (message: string, metadata?: LoggerMetadata) =>
    write('error', message, metadata),
};
