import { FormattedQuote } from '@/lib/pendle/quotes'
import * as pendleTransactions from '@/lib/pendle/transactions'
import { SimplifiedPendleMarket } from '@/lib/types/pendle'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronsUpDown,
  CircleDollarSign,
  Loader2,
  TimerReset
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { SimpleQuoteDisplay } from './simple-quote-display'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog'

export interface OpportunityCardProps extends SimplifiedPendleMarket {
  // All fields are inherited from SimplifiedPendleMarket
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

export const OpportunityCard: React.FC<OpportunityCardProps> = (market) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string>('')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteDirection, setQuoteDirection] = useState<'pt' | 'yt'>('pt')
  
  const days = daysUntil(market.expiry)
  const expiryDate = new Date(market.expiry).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Mock token addresses for demo purposes
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  const DEFAULT_AMOUNT = "1000000000000000000" // 1 ETH in wei
  const DEFAULT_SLIPPAGE = 0.01
  // Example formatted quotes for demo purposes
  const demoEthToToken: FormattedQuote = {
    inputAmount: "1",
    inputToken: "ETH",
    outputAmount: "125.742",
    outputToken: `PT ${market.name}`,
    rate: `1 ETH = 125.742 PT ${market.name}`,
    inverse: `1 PT ${market.name} = 0.00795 ETH`
  };
  
  const demoTokenToEth: FormattedQuote = {
    inputAmount: "1",
    inputToken: `PT ${market.name}`,
    outputAmount: "0.00795",
    outputToken: "ETH",
    rate: `1 PT ${market.name} = 0.00795 ETH`,
    inverse: `1 ETH = 125.742 PT ${market.name}`
  };

  const handleGetQuote = async () => {
    setTimeout(() => {
      setShowQuoteModal(true)
    }, 0)
  }

  const handleCloseQuoteModal = useCallback(() => {
    setTimeout(() => {
      setShowQuoteModal(false)
    }, 0)
  }, [])

  const handleSwap = async () => {
    try {
      setIsLoading(true)
      setLoadingAction('swap')
      
      // For demo, execute a swap from WETH to PT
      const result = await pendleTransactions.swap(
        market,
        WETH_ADDRESS,
        market.pt,
        DEFAULT_SLIPPAGE
      )
      
      console.log('Swap executed:', result)
      // In a real implementation, you would display a transaction confirmation
    } catch (error) {
      console.error('Error executing swap:', error)
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  const handleLimitOrder = async () => {
    try {
      setIsLoading(true)
      setLoadingAction('limitOrder')
      
      // For demo, create a limit order
      const result = await pendleTransactions.limitOrder(
        market,
        WETH_ADDRESS,
        market.pt,
        DEFAULT_AMOUNT,
        "0" // Minimum amount out, would be calculated based on price and slippage
      )
      
      console.log('Limit order created:', result)
    } catch (error) {
      console.error('Error creating limit order:', error)
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  const handleMint = async () => {
    try {
      setIsLoading(true)
      setLoadingAction('mint')
      
      // For demo, mint PT and YT
      const result = await pendleTransactions.mint(
        market,
        DEFAULT_AMOUNT
      )
      
      console.log('Tokens minted:', result)
    } catch (error) {
      console.error('Error minting tokens:', error)
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  const handleRedeem = async () => {
    try {
      setIsLoading(true)
      setLoadingAction('redeem')
      
      // For demo, redeem underlying tokens
      const result = await pendleTransactions.redeem(
        market,
        DEFAULT_AMOUNT, // PT amount
        DEFAULT_AMOUNT  // YT amount
      )
      
      console.log('Tokens redeemed:', result)
    } catch (error) {
      console.error('Error redeeming tokens:', error)
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  return (
    <>
      <Card className="max-w-md w-full bg-card/80">
        <CardHeader>
          <CardTitle>{market.name}</CardTitle>
          <CardDescription>
            {expiryDate} <span className="ml-1 text-xs text-muted-foreground">({days} days)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Liquidity</span>
              <span className="font-semibold text-lg">{formatUSD(market.liquidity)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Fixed APY</span>
              <span className={`font-bold text-lg ${market.impliedApy < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatAPY(market.impliedApy)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            onClick={handleGetQuote}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
          >
            {isLoading && loadingAction === 'quote' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CircleDollarSign className="h-4 w-4 mr-1" />
            )}
            Get quote
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSwap}
            disabled={isLoading}
            className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
          >
            {isLoading && loadingAction === 'swap' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 mr-1" />
            )}
            Swap
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLimitOrder}
            disabled={isLoading}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300"
          >
            {isLoading && loadingAction === 'limitOrder' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <TimerReset className="h-4 w-4 mr-1" />
            )}
            Limit order
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMint}
            disabled={isLoading}
            className="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300"
          >
            {isLoading && loadingAction === 'mint' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4 mr-1" />
            )}
            Mint
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRedeem}
            disabled={isLoading}
            className="bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300"
          >
            {isLoading && loadingAction === 'redeem' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ArrowUpFromLine className="h-4 w-4 mr-1" />
            )}
            Redeem
          </Button>
        </CardFooter>
      </Card>

      {/* Quote Modal - Updated to use SimpleQuoteDisplay */}
      {showQuoteModal && (
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pendle {market.name} Exchange Rates</DialogTitle>
            </DialogHeader>
            <SimpleQuoteDisplay 
              tool={{
                state: 'result',
                result: {
                  market: `PT ${market.name}`,
                  rate: demoEthToToken.rate,
                  inverse_rate: demoEthToToken.inverse,
                  output_amount: demoEthToToken.outputAmount
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 