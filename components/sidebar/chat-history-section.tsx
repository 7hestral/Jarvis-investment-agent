import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar'
import { getChatsPage } from '@/lib/actions/chat'
import { ChatHistoryClient } from './chat-history-client'
import { ClearHistoryAction } from './clear-history-action'
import { privy } from '@/lib/privy/verify-access-token'
import { headers } from 'next/headers'
export async function ChatHistorySection() {
  const enableSaveChatHistory = process.env.ENABLE_SAVE_CHAT_HISTORY === 'true'
  if (!enableSaveChatHistory) {
    return null
  }

  // Fetch the initial page of chats
  const headersList = await headers()
  // console.log('All headers:', Object.fromEntries(headersList.entries()))

  const authToken = headersList.get('authorization')?.replace(/^Bearer /, '')
  
  let userId = 'anonymous'
  if (authToken) {
    try {
      const claims = await privy.verifyAuthToken(authToken)
      userId = claims.userId
    } catch (error) {
      console.error('Failed to verify auth token:', error)
    }
  } else {
    console.log('No auth token found in headers')
  }
  const { chats, nextOffset } = await getChatsPage(userId, 20, 0)

  return (
    <div className="flex flex-col flex-1 h-full">
      <SidebarGroup>
        <div className="flex items-center justify-between w-full">
          <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
          <ClearHistoryAction empty={!chats?.length && !nextOffset} />
        </div>
      </SidebarGroup>
      <ChatHistoryClient initialChats={chats} initialNextOffset={nextOffset} />
    </div>
  )
}
