'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CopyableWalletAddressProps {
  walletAddress: string
  className?: string
  walletAddressIntroText?: string
  walletAddressNotAvailableText?: string
}

export function CopyableWalletAddress({
  walletAddress,
  className,
  walletAddressIntroText,
  walletAddressNotAvailableText
}: CopyableWalletAddressProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const onCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(walletAddress)
      setHasCopied(true)
    }
  }

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])


  if (!walletAddress) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          className
        )}
      >
        <span>
          {walletAddressNotAvailableText || 'Wallet address not available.'}
        </span>
      </div>
    )
  }

  const shortAddress = `${walletAddress.substring(
    0,
    6
  )}...${walletAddress.substring(walletAddress.length - 4)}`

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}
    >
      <span>
        {walletAddressIntroText || 'Your wallet address:'} {shortAddress}
      </span>
      <Button
        onClick={onCopy}
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label="Copy wallet address"
        disabled={typeof navigator === 'undefined' || !navigator.clipboard}
      >
        {hasCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
      </Button>
    </div>
  )
}
