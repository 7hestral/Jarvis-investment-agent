'use client'

import { useLogin } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
export function LoginButton() {
  const router = useRouter()
  const { login } = useLogin({
    onComplete: () => router.push('/search')
  })

  return (
    <Button variant="outline" onClick={login}>
      Login
    </Button>
  )
}
