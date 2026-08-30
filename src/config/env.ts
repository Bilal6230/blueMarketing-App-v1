import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z
    .string()
    .min(1, 'EXPO_PUBLIC_API_BASE_URL is required.')
    .url('EXPO_PUBLIC_API_BASE_URL must be a valid URL.'),
});

const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration. ${parsedEnv.error.issues.map((issue) => issue.message).join(' ')}`,
  );
}

const apiBaseUrl = parsedEnv.data.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, '');

export const env = {
  apiBaseUrl,
  publicEnvNote:
    'Expo EXPO_PUBLIC_* values are visible in the client bundle and must never contain secrets.',
} as const;
