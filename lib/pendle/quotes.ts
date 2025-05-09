import axios from 'axios'
import { ethers } from 'ethers'
import { SimplifiedPendleMarket } from '../types/pendle'

// Define the quote response type from the API
export interface SwapQuoteResponse {
  data: {
    amountOut: string
    priceImpact: number
  }
}

// Define a more user-friendly quote result with formatted values
export interface FormattedQuote {
  inputAmount: string
  inputToken: string
  outputAmount: string
  outputToken: string
  rate: string
  inverse: string
}

// Native ETH is represented by the zero address in the Pendle API
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000"
// WETH address for API compatibility
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

// API base URL
const BASE_URL = 'https://api-v2.pendle.finance/core/v1'

/**
 * Get a quote for swapping ETH to PT or YT
 * @param market The Pendle market or market address
 * @param tokenOut The output token address (PT or YT)
 * @param marketName Optional market name for display purposes
 * @param amountInEth Amount of ETH to swap (in ETH units)
 * @param chainId Chain ID (default: 1 for Ethereum Mainnet)
 * @returns Promise with the formatted quote
 * @throws Error if API call fails or returns invalid data
 */
export async function getQuote(
  market: SimplifiedPendleMarket | string,
  tokenOut: string,
  marketName?: string,
  amountInEth: string = "1",
  chainId: number = 1
): Promise<FormattedQuote> {
  const startTime = Date.now();
  try {
    // Handle both market object and market address string
    const marketAddress = typeof market === 'string' ? market : market.address;
    
    // Normalize market address by removing "1-" prefix if it exists
    const normalizedMarketAddress = marketAddress.startsWith('1-') 
      ? marketAddress.substring(2) 
      : marketAddress;
    
    console.log(`[Quotes] Original market address: ${marketAddress}`);
    console.log(`[Quotes] Normalized market address: ${normalizedMarketAddress}`);
    
    // Use the provided market name directly - this should already include PT/YT prefix
    const displayName = marketName || 'Unknown Market';
    
    // Convert ETH amount to wei
    let amountInWei;
    try {
      amountInWei = ethers.parseEther(amountInEth).toString();
    } catch (error) {
      throw new Error(`Invalid ETH amount: ${amountInEth}`);
    }
    
    // Use environment variable for receiver address, error if not set
    if (!process.env.WALLET_ADDRESS) {
      throw new Error("WALLET_ADDRESS environment variable is not set.");
    }
    const RECEIVER = process.env.WALLET_ADDRESS;
    
    // Format the URL
    const url = `${BASE_URL}/sdk/${chainId}/markets/${normalizedMarketAddress}/swap`;
    
    // Normalize tokenOut by removing "1-" prefix if it exists
    const normalizedTokenOut = tokenOut.startsWith('1-') ? tokenOut.substring(2) : tokenOut;
    
    console.log(`[Quotes] Original tokenOut address: ${tokenOut}`);
    console.log(`[Quotes] Normalized tokenOut address: ${normalizedTokenOut}`);
    
    // Create params object
    const params = {
      tokenIn: WETH_ADDRESS,
      tokenOut: normalizedTokenOut,
      amountIn: amountInWei,
      slippage: 1.0,
      receiver: RECEIVER,
      enableAggregator: true,
      chainId: chainId,
      market: normalizedMarketAddress
    };
    
    console.log("[Quotes] Making request with params:", JSON.stringify(params, null, 2));
    
    // Make API request with a timeout of 15 seconds
    const response = await axios.get(url, { 
      params,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 15000 // 15 seconds timeout
    });
    
    // Validate response
    if (!response.data) {
      throw new Error('Empty response from Pendle API');
    }
    
    const quoteData = response.data as SwapQuoteResponse;
    
    // Extract amount out
    if (!quoteData.data || !quoteData.data.amountOut) {
      throw new Error('Invalid response format: missing amountOut');
    }
    
    const amountOut = quoteData.data.amountOut || "0";
    
    // Format the output amount
    const outputAmountBigInt = BigInt(amountOut);
    const outputDecimalAmount = ethers.formatUnits(outputAmountBigInt, 18);
    
    // Use the provided displayName directly instead of trying to determine token type
    const tokenName = displayName;
    
    // Calculate exchange rates
    const inputAmountFloat = parseFloat(amountInEth);
    const outputAmountFloat = parseFloat(outputDecimalAmount);
    const rate = (outputAmountFloat / inputAmountFloat).toFixed(6);
    const inverse = (inputAmountFloat / outputAmountFloat).toFixed(6);
    
    // Return formatted quote
    const result = {
      inputAmount: amountInEth,
      inputToken: "ETH",
      outputAmount: outputDecimalAmount,
      outputToken: tokenName,
      rate: `1 ETH = ${rate} ${tokenName}`,
      inverse: `1 ${tokenName} = ${inverse} ETH`
    };
    
    return result;
  } catch (error: any) {
    throw error;
  }
}