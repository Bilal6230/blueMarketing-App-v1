import * as Crypto from 'expo-crypto';

export async function generateRequestId() {
  return Crypto.randomUUID();
}
