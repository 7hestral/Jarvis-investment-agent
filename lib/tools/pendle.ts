import { tool } from 'ai'
import { z } from 'zod'
import { getPendleMarkets } from '../pendle/api'
import { getQuote } from '../pendle/quotes'
import { PendleTransactionService } from '../pendle/transaction-service'

export const pendleOpportunitiesTool = tool({
  description: 'Get Pendle yield opportunities on Ethereum.',
  parameters: z.object({
    max_results: z.number().min(1).max(50).default(10)
      .describe('Number of opportunities to return (default 10)'),
    apy_gte: z.number().optional()
      .describe('Minimum APY (greater than or equal to, optional)'),
    apy_lte: z.number().optional()
      .describe('Maximum APY (less than or equal to, optional)')
  }),
  execute: async ({ max_results = 10, apy_gte, apy_lte }) => {
    const all = await getPendleMarkets()
    let filtered = all
    if (apy_gte !== undefined) filtered = filtered.filter(o => o.impliedApy >= apy_gte)
    if (apy_lte !== undefined) filtered = filtered.filter(o => o.impliedApy <= apy_lte)
    return filtered.slice(0, max_results)
  }
})

export const pendleQuoteTool = tool({
  description: 'Get a quote for swapping ETH to a Pendle market token.',
  parameters: z.object({
    market_address: z.string()
      .describe('The address of the Pendle market'),
    token_out_address: z.string()
      .describe('The address of the token to receive (PT or YT)'),
    market_name: z.string()
      .describe('The name of the market (required, e.g. "rswETH")'),
    token_type: z.enum(['pt', 'yt'])
      .describe('The token type - "pt" for Principal Token or "yt" for Yield Token')
  }),
  execute: async ({ market_address, token_out_address, market_name, token_type }) => {
    try {
      // Format full token name with PT/YT prefix
      const fullTokenName = `${token_type.toUpperCase()} ${market_name}`;
      
      // Normalize addresses to remove "1-" prefix if it exists
      const normalizedMarketAddress = market_address.startsWith('1-') 
        ? market_address.substring(2).toLowerCase().trim() 
        : market_address.toLowerCase().trim();
      
      const normalizedTokenOutAddress = token_out_address.startsWith('1-') 
        ? token_out_address.substring(2).toLowerCase().trim() 
        : token_out_address.toLowerCase().trim();
        
      console.log(`[PendleQuoteTool] Using normalized addresses - Market: ${normalizedMarketAddress}, TokenOut: ${normalizedTokenOutAddress}`);
      
      // Call the getQuote function with fixed parameters for simplicity
      const quote = await getQuote(
        normalizedMarketAddress,
        normalizedTokenOutAddress,
        fullTokenName, // Pass the properly formatted token name
        '1', // Fixed amount of 1 ETH
        1    // Fixed chain ID (Ethereum)
      );
      
      // Return a clean response object
      return {
        market: fullTokenName,
        rate: quote.rate,
        inverse_rate: quote.inverse,
        output_amount: quote.outputAmount
      };
    } catch (error: any) {
      // Return a simple error object
      return {
        error: error.message || 'Failed to get quote',
        market_address,
        token_out_address
      };
    }
  }
})

export const pendleSwapTool = tool({
  description: 'Execute a swap of ETH to a Pendle market token (PT or YT).',
  parameters: z.object({
    market_address: z.string()
      .describe('The address of the Pendle market'),
    token_out_address: z.string()
      .describe('The address of the token to receive (PT or YT)'),
    amount_in_eth: z.string()
      .describe('Amount of ETH to swap (in ETH units, e.g. "0.1")'),
    slippage: z.number().min(0.001).max(1.0).default(1.0)
      .describe('Slippage tolerance as a decimal (e.g. 1.0 for 100%), default 100%')
  }),
  execute: async ({ market_address, token_out_address, amount_in_eth, slippage = 1.0 }) => {
    try {
      // Initialize transaction service
      const transactionService = new PendleTransactionService()
      
      // Normalize addresses to remove "1-" prefix if it exists
      const normalizedMarketAddress = market_address.startsWith('1-') 
        ? market_address.substring(2).toLowerCase().trim() 
        : market_address.toLowerCase().trim();
      
      const normalizedTokenOutAddress = token_out_address.startsWith('1-') 
        ? token_out_address.substring(2).toLowerCase().trim() 
        : token_out_address.toLowerCase().trim();
      
      console.log(`[Tools] Using normalized addresses - Market: ${normalizedMarketAddress}, TokenOut: ${normalizedTokenOutAddress}`);
      
      // Execute the swap with detailed status tracking
      const result = await transactionService.executeSwap(
        normalizedMarketAddress,
        normalizedTokenOutAddress,
        amount_in_eth,
        slippage
      )
      
      // Return the final transaction status
      return {
        status: result.status,
        transaction_hash: result.txHash,
        error: result.error,
        details: {
          market_address,
          token_out_address,
          amount_in_eth,
          slippage: `${slippage * 100}%`
        },
        steps: result.steps.map(step => ({
          message: step.message,
          status: step.status,
          timestamp: step.timestamp,
          details: step.details
        }))
      };
    } catch (error: any) {
      // Return error information
      return {
        status: 'error',
        error: error.message || 'Failed to execute swap',
        details: {
          market_address,
          token_out_address,
          amount_in_eth
        },
        steps: [{
          message: 'Unexpected error occurred',
          status: 'error',
          timestamp: Date.now(),
          details: error.message
        }]
      };
    }
  }
})