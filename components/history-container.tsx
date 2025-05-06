import { privy } from '@/lib/privy/verify-access-token'
import { headers } from 'next/headers'
import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'

const HistoryContainer: React.FC = async () => {
  const enableSaveChatHistory = process.env.ENABLE_SAVE_CHAT_HISTORY === 'true'
  if (!enableSaveChatHistory) {
    return null
  }

  const headersList = await headers()
  // console.log('All headers:', Object.fromEntries(headersList.entries()))

  const authToken = headersList.get('authorization')?.replace(/^Bearer /, '')
  console.log(
    'Authorization header present:',
    !!headersList.get('authorization')
  )
  console.log('Auth token present:', !!authToken)

  let userId = 'anonymous'
  if (authToken) {
    try {
      const claims = await privy.verifyAuthToken(authToken)
      userId = claims.userId
      console.log('Successfully verified token:')
      console.log('- userId:', userId)
      console.log('- token:', authToken)
    } catch (error) {
      console.error('Failed to verify auth token:', error)
      console.log('Invalid token:', authToken)
    }
  } else {
    console.log('No auth token found in headers')
  }

  return (
    <div>
      <History>
        <HistoryList userId={userId} />
      </History>
    </div>
  )
}

export default HistoryContainer
