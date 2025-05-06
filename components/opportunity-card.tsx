import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export interface OpportunityCardProps {
  name: string
  expiry: string // ISO string
  liquidity: number // in USD
  impliedApy: number // as decimal, e.g. 0.02821
}

function formatUSD(num: number) {
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

function formatAPY(apy: number) {
  return `${(apy * 100).toFixed(3)}%`
}

function daysUntil(dateStr: string) {
  const now = new Date()
  const expiry = new Date(dateStr)
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  name,
  expiry,
  liquidity,
  impliedApy,
}) => {
  const days = daysUntil(expiry)
  const expiryDate = new Date(expiry).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="max-w-md w-full bg-card/80">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {expiryDate} <span className="ml-1 text-xs text-muted-foreground">({days} days)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Liquidity</span>
            <span className="font-semibold text-lg">{formatUSD(liquidity)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Fixed APY</span>
            <span className={`font-bold text-lg ${impliedApy < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatAPY(impliedApy)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 