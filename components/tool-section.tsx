'use client'

import { ExtendedCoreMessage } from '@/lib/types'
import { ToolInvocation } from 'ai'
import { PendleOpportunitiesSection } from './pendle-opportunities-section'
import { PendleSwapSection } from './pendle-swap-section'
import { QuestionConfirmation } from './question-confirmation'
import RetrieveSection from './retrieve-section'
import { SearchSection } from './search-section'
import { SimpleQuoteDisplay } from './simple-quote-display'
import { VideoSearchSection } from './video-search-section'
import { WalletBalanceSection } from './wallet-balance-section'

interface ToolSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  addToolResult?: (params: { toolCallId: string; result: any }) => void
  message?: ExtendedCoreMessage
  i?: number
}

export function ToolSection({
  tool,
  isOpen,
  onOpenChange,
  addToolResult,
  message,
  i
}: ToolSectionProps) {
  // Special handling for ask_question tool
  if (tool.toolName === 'ask_question') {
    // When waiting for user input
    if (tool.state === 'call' && addToolResult) {
      return (
        <QuestionConfirmation
          toolInvocation={tool}
          onConfirm={(toolCallId, approved, response) => {
            addToolResult({
              toolCallId,
              result: approved
                ? response
                : {
                    declined: true,
                    skipped: response?.skipped,
                    message: 'User declined this question'
                  }
            })
          }}
        />
      )
    }

    // When result is available, display the result
    if (tool.state === 'result') {
      return (
        <QuestionConfirmation
          toolInvocation={tool}
          isCompleted={true}
          onConfirm={() => {}} // Not used in result display mode
        />
      )
    }
  }

  // Handle tool call data
  if (message && message.role === 'data' && typeof message.content === 'object' && message.content && 
      // @ts-ignore - we know these exist based on the structure
      message.content.type === 'tool_call') {
    // @ts-ignore - we know these exist
    const toolName = message.content.data.toolName
    // @ts-ignore
    let toolResult = JSON.parse(message.content.data.result || '{}')

    // Return the appropriate component based on tool name
    if (toolName === 'search') {
      // @ts-ignore - this is handled correctly in the component
      return <SearchSection results={toolResult} />
    } else if (toolName === 'pendle_opportunities') {
      // @ts-ignore - this is handled correctly in the component
      return <PendleOpportunitiesSection opportunities={toolResult} />
    } else if (toolName === 'wallet_balance') {
      // @ts-ignore - this is handled correctly in the component
      return <WalletBalanceSection balances={toolResult} />
    } else if (toolName === 'pendle_swap') {
      return <PendleSwapSection swapResult={toolResult} />
    }
  }

  switch (tool.toolName) {
    case 'search':
      return (
        <SearchSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'videoSearch':
      return (
        <VideoSearchSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'retrieve':
      return (
        <RetrieveSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'pendle_opportunities':
      return (
        <PendleOpportunitiesSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'pendle_quote':
      return (
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col">
            <h3 className="text-base font-medium">Pendle Quote</h3>
            <div className="mt-2">
              <SimpleQuoteDisplay tool={tool} isOpen={isOpen} onOpenChange={onOpenChange} />
            </div>
          </div>
        </div>
      )
    case 'pendle_swap':
      // Parse the result data safely
      const swapResult = tool.state === 'result' 
        ? (typeof tool.result === 'string' ? JSON.parse(tool.result) : tool.result)
        : { status: 'pending' };
        
      return (
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col">
            <h3 className="text-base font-medium">Pendle Swap Transaction</h3>
            <div className="mt-2">
              <PendleSwapSection swapResult={swapResult} />
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}
