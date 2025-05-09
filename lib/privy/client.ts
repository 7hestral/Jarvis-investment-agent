// lib/privy.ts
import { AuthTokenClaims, PrivyClient, User } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!
const appSecret = process.env.PRIVY_APP_SECRET!

export const privy = new PrivyClient(appId, appSecret)

export async function verifyAccessToken(): Promise<AuthTokenClaims> {
  const cookieStore = await cookies()
  const token = cookieStore.get("privy-token")?.value
  if (!token) {
    throw new Error("No token found")
  }
  return privy.verifyAuthToken(token)
}

// Return user data in an identity token has to be turned on in the Privy dashboard
export async function getUser(): Promise<User> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get("privy-id-token")?.value
  if (!idToken) {
    // throw new Error("No token found")
    // Fall back to auth token
    const token = cookieStore.get("privy-token")?.value
    if (!token) {
      throw new Error("No token found")
    }
    const user = await privy.getUser(token)
    return user
  } else {
    const user = await privy.getUser({ idToken: idToken })
    return user
  }
}

export async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  const idToken = cookieStore.get("privy-id-token")?.value
  if (!idToken) {
    // Fall back to auth token
    const token = cookieStore.get("privy-token")?.value
    if (!token) {
      throw new Error("No token found")
    }
    const claims = await privy.verifyAuthToken(token)
    return claims.userId
  } else {
    const user = await privy.getUser({ idToken: idToken })
    return user.id
  }
}

export async function getUserSolWalletAddress(
  
): Promise<string | undefined> {

  return getUserWalletAddress('solana')
}

export async function getUserEvmWalletAddress(
  
): Promise<string | undefined> {

  return getUserWalletAddress('ethereum')
}

export async function getUserWalletAddress(
  chainType: string
): Promise<string | undefined> {
  const user = await getUser()
  const walletAccount = user?.linkedAccounts?.find(acc => {
    if (acc.type === 'wallet') {
      return (
        acc.chainType === chainType &&
        acc.address)
    }
    return false
  })

  if (walletAccount && walletAccount.type === 'wallet') {
    if (walletAccount.address) {
      return walletAccount.address
    }
  }
  return undefined
}
