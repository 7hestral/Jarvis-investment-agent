// lib/privy.ts
import { PrivyClient, AuthTokenClaims } from '@privy-io/server-auth';

const appId     = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const appSecret = process.env.PRIVY_APP_SECRET!;

export const privy = new PrivyClient(appId, appSecret);

export async function verifyAccessToken(token: string): Promise<AuthTokenClaims> {
  return privy.verifyAuthToken(token);
}
