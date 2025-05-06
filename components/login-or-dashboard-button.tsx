'use client'

import { usePrivy } from '@privy-io/react-auth'
import { DashboardButton } from './dashboard-button'
import { LoginButton } from './login-button'
export function LoginOrDashboardButton() {
  const { authenticated } = usePrivy()

  return <div>{authenticated ? <DashboardButton /> : <LoginButton />}</div>
}
