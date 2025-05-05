'use client'

import { DashboardButton } from './dashboard-button'
import { LoginButton } from './login-button'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
export function LoginOrDashboardButton() {
  const { authenticated } = usePrivy()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(authenticated)
  }, [authenticated])
  return (
    <div>
      {isAuthenticated ? <DashboardButton /> : <LoginButton />}
    </div>
  )
}
