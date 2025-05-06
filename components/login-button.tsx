'use client'

import type { LinkedAccountWithMetadata, User } from '@privy-io/react-auth'
import { getAccessToken, useLogin } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

export function LoginButton() {
  const router = useRouter()
  const { login } = useLogin({
    onComplete: async (params: {
      user: User
      isNewUser: boolean
      wasAlreadyAuthenticated: boolean
      loginMethod: any | null
      loginAccount: LinkedAccountWithMetadata | null
    }) => {
      try {
        const token = await getAccessToken()
        if (!token) {
          throw new Error('No access token available')
        }
        // Set cookie with proper attributes for cross-request access
        document.cookie = `privy-token=${token}; path=/; max-age=2592000; SameSite=Lax`
        router.push('/search')
      } catch (error) {
        console.error('Error during login:', error)
      }
    }
  })

  return (
    <Button
      onClick={() => login()}
      className="bg-black text-white hover:bg-gray-800"
    >
      Login
    </Button>
  )
}
