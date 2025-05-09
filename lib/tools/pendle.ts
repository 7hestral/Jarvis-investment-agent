import { tool } from 'ai'
import { z } from 'zod'
import { getPendleMarkets } from '../pendle/api'
import { getQuote } from '../pendle/quotes'

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
      
      // Call the getQuote function with fixed parameters for simplicity
      const quote = await getQuote(
        market_address.toLowerCase().trim(),
        token_out_address.toLowerCase().trim(),
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