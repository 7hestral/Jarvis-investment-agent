'use client'

import type { ToolInvocation } from 'ai'
import { CollapsibleMessage } from './collapsible-message' // Assuming this can be reused
import { Section, ToolArgsSection } from './section' // Assuming this can be reused

interface TransferSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface PrivyTransferArgs {
  address: string
  amount: number
}

interface PrivyTransferResult {
  status: 'success' | 'fail'
  hash?: string
  error_message?: any
}

export function TransferSection({
  tool,
  isOpen,
  onOpenChange
}: TransferSectionProps) {
  const args = tool.args as PrivyTransferArgs

  const header = (
    <ToolArgsSection tool="transfer">{`Transfer to ${args.address} for ${args.amount} ETH`}</ToolArgsSection>
  )

  let statusMessage = ''

  switch (tool.state) {
    case 'call':
      statusMessage = 'Transfer in progress...'
      break
    case 'result':
      const toolResult = tool.result as PrivyTransferResult
      console.log(toolResult)
      if (toolResult.status === 'success' || toolResult.hash) {
        statusMessage = `\n
        Transfer successful! \n
        Transaction Hash: ${toolResult.hash}`
      } else {
        statusMessage = `\nTransfer failed: ${JSON.stringify(
          toolResult.error_message
        )}`
      }
      break
    default:
      statusMessage = `Status: ${tool.state}`
      break
  }

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showIcon={true} // Assuming we want an icon
    >
      {statusMessage && <Section title="Transaction">{statusMessage}</Section>}
    </CollapsibleMessage>
  )
}
