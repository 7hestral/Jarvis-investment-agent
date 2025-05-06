import { tool } from 'ai'
import { z } from 'zod'
import { getPendleMarkets } from '../pendle/api'

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