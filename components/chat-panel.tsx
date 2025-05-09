'use client'

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { usePrivy } from '@privy-io/react-auth'
import { Message } from 'ai'
import { ArrowUp, ChevronDown, MessageCirclePlus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { useWalletAddresses } from '../lib/hooks/use-evm-and-sol-addresses'
import { useArtifact } from './artifact/artifact-context'
import { CopyableWalletAddress } from './copyable-wallet-address'
import { CopyableWalletAddressSkeleton } from './copyable-wallet-address-skeleton'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'
import { WelcomeMessage } from './welcome-messages'
import { WalletWithMetadata, useHeadlessDelegatedActions, useWallets, useSolanaWallets } from '@privy-io/react-auth'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether auto-scroll is currently active (at bottom) */
  isAutoScroll: boolean
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  isAutoScroll
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { ready, authenticated, user } = usePrivy()
  const { evmAddress, solAddress } = useWalletAddresses(
    ready,
    authenticated,
    user
  )
  const { wallets: evmWallets, ready: evmReady } = useWallets()
  const { wallets: solanaWallets, ready: solanaReady } = useSolanaWallets()
  const [isNewUser, setIsNewUser] = useState(false)
  const [ walletAddress, setWalletAddress ] = useState('')
  const { close: closeArtifact } = useArtifact()
  const { delegateWallet } = useHeadlessDelegatedActions()
  // Generate a deterministic seed for welcome message based on date
  // This will change each day but remain consistent throughout the day
  const welcomeSeed = useRef(new Date().getDate()).current

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false

    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]

    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    if (!ready) {
      return
    }
    if (!authenticated) {
      return
    }
    if (user) {
      const created = new Date(user!.createdAt)
      const now = new Date()

      // e.g. consider "first login" if created < 1 minute ago
      const isFirstLogin = now.getTime() - created.getTime() < 60_000
      setIsNewUser(isFirstLogin)
      setWalletAddress(user.wallet?.address || '')


    }
  }, [ready, authenticated, user])

  useEffect(() => {
    if (!ready) return
    if (!authenticated) return
    if (!user) return
    if (!evmReady) return
    if (!solanaReady) return
    const created = new Date(user!.createdAt)
    const now = new Date()

    // e.g. consider "first login" if created < 2 minute ago
    const isFirstLogin = now.getTime() - created.getTime() < 120_000
    if (evmReady && solanaReady && isFirstLogin) {
      const evmWallet = user.linkedAccounts.find((wallet) => {
        if (wallet.type == 'wallet') {
          return wallet.walletClientType === 'privy' && wallet.chainType === 'ethereum' && wallet.connectorType === 'embedded'
        }
      }) as WalletWithMetadata | undefined;
      console.log("evmReady", evmReady)
      console.log(evmWallets)
      console.log('evmWallet in chat panel', evmWallet)

      const solWallet = solanaWallets.find(
        wallet => wallet.walletClientType === 'privy'
      ) as WalletWithMetadata | undefined

      if (evmWallet?.address) {

        console.log('evmWallet delegated')
        delegateWallet({ address: evmWallet.address, chainType: 'ethereum' })
      }
      if (solWallet?.address) {
        console.log('solWallet delegated')
        delegateWallet({ address: solWallet.address, chainType: 'solana' })
      }
    }
  }, [evmReady, solanaReady, authenticated, ready])


  // Add scroll to bottom handler
  const handleScrollToBottom = () => {
    const scrollContainer = document.getElementById('scroll-container')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      className={cn(
        'w-full bg-background group/form-container shrink-0',
        messages.length > 0 ? 'sticky bottom-0 px-2 pb-4' : 'px-6'
      )}
    >
      {messages.length === 0 && (
        <div className="mb-10 flex flex-col items-center gap-4">
          <IconLogo className="size-12 text-muted-foreground" />
          {!ready && (
            <div>
              <CopyableWalletAddressSkeleton className="justify-center" />
              <CopyableWalletAddressSkeleton className="justify-center" />
            </div>
          )}
          {ready && !authenticated && (
            <div>
              <CopyableWalletAddress
                walletAddress=""
                className="justify-center"
                walletAddressNotAvailableText="Please sign in"
              />
              <CopyableWalletAddress
                walletAddress=""
                className="justify-center"
                walletAddressNotAvailableText="We will create/retrieve your wallets"
              />
            </div>
          )}
          {evmAddress && solAddress && isNewUser && (
            <div>
              <CopyableWalletAddress
                walletAddress={evmAddress}
                className="justify-center"
                walletAddressIntroText="🎉 Congrats! Your delegated wallets have been successfully created. EVM wallet address:"
              />
              <CopyableWalletAddress
                walletAddress={solAddress}
                className="justify-center"
                walletAddressIntroText="Your delegated Solana wallet address:"
              />
            </div>
          )}
          {evmAddress && solAddress && !isNewUser && (
            <div>
              <CopyableWalletAddress
                walletAddress={evmAddress}
                className="justify-center"
                walletAddressIntroText="Your delegated EVM wallet address:"
              />
              <CopyableWalletAddress
                walletAddress={solAddress}
                className="justify-center"
                walletAddressIntroText="Your delegated Solana wallet address:"
              />
            </div>
          )}
          <WelcomeMessage seed={welcomeSeed} />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn('max-w-3xl w-full mx-auto relative')}
      >
        {/* Add scroll-down button to ChatPanel right top - show when not auto scrolling */}
        {!isAutoScroll && messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -top-10 right-4 z-20 size-8 rounded-full shadow-md"
            onClick={handleScrollToBottom}
            title="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </Button>
        )}

        <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
          <Textarea
            ref={inputRef}
            name="input"
            rows={2}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask a question..."
            spellCheck={false}
            value={input}
            disabled={isLoading || isToolInvocationInProgress()}
            className="resize-none w-full min-h-12 bg-transparent border-0 p-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            onChange={e => {
              handleInputChange(e)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />

          {/* Bottom menu area */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <ModelSelector models={models || []} />
              <SearchModeToggle />
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewChat}
                  className="shrink-0 rounded-full group"
                  type="button"
                  disabled={isLoading || isToolInvocationInProgress()}
                >
                  <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
                </Button>
              )}
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={'icon'}
                variant={'outline'}
                className={cn(isLoading && 'animate-pulse', 'rounded-full')}
                disabled={
                  (input.length === 0 && !isLoading) ||
                  isToolInvocationInProgress()
                }
                onClick={isLoading ? stop : undefined}
              >
                {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {messages.length === 0 && (
          <EmptyScreen
            submitMessage={message => {
              handleInputChange({
                target: { value: message }
              } as React.ChangeEvent<HTMLTextAreaElement>)
            }}
            className={cn(showEmptyScreen ? 'visible' : 'invisible')}
          />
        )}
      </form>
    </div>
  )
}
