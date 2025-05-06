import { PendleMarket, PendleResponse, SimplifiedPendleMarket } from '../types/pendle'

const BASE_URL = 'https://api-v2.pendle.finance/core'
const CHAIN_ID = 1 // Ethereum

/**
 * Fetches all markets from Pendle API for Ethereum chain
 * @returns Promise<PendleResponse>
 */
export async function fetchPendleMarkets(): Promise<PendleResponse> {
  try {
    const response = await fetch(`${BASE_URL}/v1/${CHAIN_ID}/markets/active`)
    
    if (!response.ok) {
      throw new Error(`Pendle API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as PendleResponse
  } catch (error) {
    console.error('Error fetching Pendle markets:', error)
    throw error
  }
}

/**
 * Processes Pendle markets data to extract required information
 * @param markets Array of PendleMarket
 * @returns Array of SimplifiedPendleMarket
 */
export function processPendleMarkets(markets: PendleMarket[]): SimplifiedPendleMarket[] {
  return markets.map(market => ({
    name: market.name,
    address: market.address,
    expiry: market.expiry,
    liquidity: market.details.liquidity,
    impliedApy: market.details.impliedApy
  }))
}

/**
 * Fetches and processes Pendle markets data
 * @returns Promise<SimplifiedPendleMarket[]>
 */
export async function getPendleMarkets(): Promise<SimplifiedPendleMarket[]> {
  const response = await fetchPendleMarkets()
  return processPendleMarkets(response.markets)
} 