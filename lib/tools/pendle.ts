import { tool } from 'ai'
import { ethers } from 'ethers'
import { z } from 'zod'
import { getPendleMarkets } from '../pendle/api'
import { getQuote } from '../pendle/quotes'
import { executeSwapTransaction, getSwapEthToTokenTransaction } from '../pendle/transactions'

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

export const pendleSwapTool = tool({
  description: 'Execute a swap transaction from ETH to a Pendle token (PT or YT).',
  parameters: z.object({
    market_address: z.string()
      .describe('The address of the Pendle market'),
    token_out_address: z.string()
      .describe('The address of the token to receive (PT or YT)'),
    amount_in_eth: z.string()
      .describe('Amount of ETH to swap (in ETH units, e.g. "1" for 1 ETH)'),
    slippage: z.number().min(0.001).max(0.1).default(0.01)
      .describe('Maximum acceptable slippage (default: 0.01 which is 1%)'),
    token_name: z.string().optional()
      .describe('The name of the token to receive (e.g. "PT weETH")')
  }),
  execute: async ({ market_address, token_out_address, amount_in_eth, slippage = 0.01, token_name }) => {
    try {
      // Convert ETH amount to wei
      let amountInWei;
      try {
        amountInWei = ethers.parseEther(amount_in_eth).toString();
      } catch (error) {
        throw new Error(`Invalid ETH amount: ${amount_in_eth}`);
      }
      
      // Get the transaction data
      const txData = await getSwapEthToTokenTransaction(
        market_address.toLowerCase().trim(),
        token_out_address.toLowerCase().trim(),
        amountInWei,
        slippage
      );
      
      // Execute the transaction
      const result = await executeSwapTransaction(txData);
      
      // Determine token type (PT or YT) from the token_out_address
      const isYT = token_out_address.toLowerCase().includes('yt');
      
      // Use provided token name or generate a generic one
      const tokenDisplay = token_name || (isYT ? 'YT Token' : 'PT Token');
      
      // Return a clean response object
      return {
        success: true,
        transaction_hash: result.hash,
        swap_details: {
          from: "ETH",
          to: tokenDisplay,
          amount: amount_in_eth + " ETH",
          market: market_address
        }
      };
    } catch (error: any) {
      // Return a simple error object
      return {
        success: false,
        error: error.message || 'Failed to execute swap',
        market_address,
        token_out_address
      };
    }
  }
}) 