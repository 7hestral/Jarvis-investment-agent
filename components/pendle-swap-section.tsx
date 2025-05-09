'use client'

import { ToolInvocation } from 'ai'
import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { TransactionStatus, TransactionStatusComponent, TransactionStep } from './transaction-status'

type SwapParams = {
  market_address: string
  token_out_address: string
  market_name?: string
  token_type?: 'pt' | 'yt'
  amount_in_eth: string
  slippage?: number
}

interface PendleSwapSectionProps {
  swapResult: {
    status: string
    transaction_hash?: string
    error?: string
    details?: {
      market_address: string
      token_out_address: string
      amount_in_eth: string
      slippage?: string
    }
    steps?: Array<{
      message: string
      status: string
      timestamp: number
      details?: string
    }>
  }
  tool?: ToolInvocation
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PendleSwapSection({ swapResult, tool, isOpen, onOpenChange }: PendleSwapSectionProps) {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    txHash: swapResult.transaction_hash,
    status: swapResult.status === 'success' ? 'success' : 
            swapResult.status === 'error' ? 'error' : 'pending',
    steps: [],
    error: swapResult.error
  })

  // Initialize with data from result if available
  useEffect(() => {
    if (swapResult) {
      const steps: TransactionStep[] = []
      
      // If we have steps from the result, use those
      if (swapResult.steps && swapResult.steps.length > 0) {
        // Convert the steps to our TransactionStep format
        swapResult.steps.forEach((step) => {
          steps.push({
            id: uuidv4(),
            message: step.message,
            status: step.status as TransactionStep['status'],
            timestamp: step.timestamp,
            details: step.details
          })
        })
      } else {
        // Otherwise, create synthetic steps based on the result
        // Add initialization step
        steps.push({
          id: uuidv4(),
          message: 'Initializing swap transaction',
          status: 'success',
          timestamp: Date.now() - 3000 // Backdate slightly
        })

        // Add transaction details step
        const details = swapResult.details
        if (details) {
          steps.push({
            id: uuidv4(),
            message: `Preparing swap of ${details.amount_in_eth} ETH to ${details.token_out_address.slice(0, 6)}...`,
            status: 'success',
            timestamp: Date.now() - 2000,
            details: `Market: ${details.market_address}\nOutput Token: ${details.token_out_address}\nAmount: ${details.amount_in_eth} ETH\nSlippage: ${details.slippage || '1%'}`
          })
        }

        // Add transaction execution step
        if (swapResult.status === 'success') {
          steps.push({
            id: uuidv4(),
            message: 'Transaction submitted to network',
            status: 'success',
            timestamp: Date.now() - 1000,
            details: `Transaction Hash: ${swapResult.transaction_hash}`
          })
          
          steps.push({
            id: uuidv4(),
            message: 'Transaction confirmed',
            status: 'success',
            timestamp: Date.now(),
            details: 'The swap has been successfully confirmed on the blockchain.'
          })
        } else if (swapResult.status === 'error') {
          steps.push({
            id: uuidv4(),
            message: 'Transaction failed',
            status: 'error',
            timestamp: Date.now(),
            details: swapResult.error
          })
        } else {
          // Transaction is pending
          steps.push({
            id: uuidv4(),
            message: 'Transaction submitted to network',
            status: 'success',
            timestamp: Date.now() - 1000,
            details: swapResult.transaction_hash ? 
              `Transaction Hash: ${swapResult.transaction_hash}` : 
              'Waiting for transaction hash...'
          })
          
          steps.push({
            id: uuidv4(),
            message: 'Waiting for confirmation',
            status: 'processing',
            timestamp: Date.now(),
            details: 'Transaction is being processed on the blockchain. This may take a few minutes.'
          })
        }
      }

      setTxStatus(prevState => ({
        ...prevState,
        steps,
        txHash: swapResult.transaction_hash
      }))
    }
  }, [swapResult])

  const handleReset = useCallback(() => {
    setTxStatus({
      status: 'idle',
      steps: [],
    })
  }, [])

  return (
    <div className="space-y-4">
      <TransactionStatusComponent 
        transaction={txStatus} 
        title="Pendle Swap Transaction" 
        description="Status of your Pendle token swap transaction."
        onReset={handleReset}
      />
    </div>
  )
}