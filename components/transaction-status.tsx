'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, Check, Clock, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from './ui/card'

export type TransactionStep = {
  id: string
  message: string
  status: 'pending' | 'processing' | 'success' | 'error'
  timestamp: number
  details?: string
}

export type TransactionStatus = {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  steps: TransactionStep[]
  error?: string
}

interface TransactionStatusProps {
  transaction: TransactionStatus
  title?: string
  description?: string
  onReset?: () => void
}

export function TransactionStatusComponent({
  transaction,
  title = "Transaction Status",
  description = "Real-time updates on your transaction.",
  onReset
}: TransactionStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  // Auto-scroll to bottom when new steps are added
  useEffect(() => {
    const logContainer = document.getElementById('transaction-log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, [transaction.steps.length])

  const renderStatusIcon = (status: TransactionStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const renderStatusBadge = (status: TransactionStatus['status']) => {
    switch (status) {
      case 'idle':
        return <Badge variant="outline">Waiting</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {renderStatusBadge(transaction.status)}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          id="transaction-log-container"
          className="max-h-[300px] overflow-y-auto space-y-2 mb-2 p-3 bg-gray-50 rounded-md"
        >
          {transaction.steps.length === 0 ? (
            <div className="text-gray-500 text-center py-2">No transaction steps yet.</div>
          ) : (
            transaction.steps.map((step) => (
              <div key={step.id} className="flex gap-2">
                <div className="mt-0.5">{renderStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      step.status === 'error' && "text-red-600",
                      step.status === 'success' && "text-green-600"
                    )}>
                      {step.message}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {step.details && showDetails && (
                    <div className="text-xs mt-1 text-gray-600 bg-gray-100 p-2 rounded whitespace-pre-wrap font-mono">
                      {step.details}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {transaction.txHash && (
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <span className="font-medium">Transaction Hash:</span>
            <Link 
              href={`https://etherscan.io/tx/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-blue-600 hover:underline"
            >
              <span className="font-mono">
                {transaction.txHash.slice(0, 6)}...{transaction.txHash.slice(-4)}
              </span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
        )}
        
        {transaction.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
            <div className="font-semibold mb-1">Transaction Failed</div>
            <p>{transaction.error}</p>
            
            {/* Add specific guidance for slippage errors */}
            {(transaction.error.includes("slippage") || 
              transaction.error.includes("Slippage") || 
              transaction.error.includes("price moved") || 
              transaction.error.includes("Return amount")) && (
              <div className="mt-2 pt-2 border-t border-red-100">
                <p className="font-medium">Suggested Actions:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Increase slippage tolerance (currently {transaction.steps.find(s => s.message.includes('Fetching swap details'))?.details?.match(/Slippage: (\d+\.?\d*)%/)?.[1] || '100'}%)</li>
                  <li>Try a smaller transaction amount</li>
                  <li>Wait for market conditions to stabilize</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
        {(transaction.status === 'success' || transaction.status === 'error') && onReset && (
          <Button 
            variant={transaction.status === 'error' ? "destructive" : "outline"} 
            size="sm"
            onClick={onReset}
          >
            {transaction.status === 'error' ? "Try Again" : "New Transaction"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}