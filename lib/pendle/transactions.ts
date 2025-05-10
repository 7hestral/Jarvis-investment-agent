import axios from 'axios'
import { ethers } from 'ethers'
import { SimplifiedPendleMarket } from '../types/pendle'

// Types for transaction responses
export interface QuoteResponse {
  amountOut: string
  priceImpact: number
  route: string[]
  fee: string
}

export interface SwapResponse {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
}

export interface LimitOrderResponse {
  id: string
  status: 'open' | 'filled' | 'cancelled'
}

export interface MintResponse {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  ptReceived: string
  ytReceived: string
}

export interface RedeemResponse {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  tokensReceived: string
}

// Native ETH is represented by the zero address in the Pendle API
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000"
// WETH address on Ethereum mainnet
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

// API base URL
const BASE_URL = 'https://api-v2.pendle.finance/core/v1'

/**
 * Get transaction data for swapping tokens with Pendle
 * @param marketAddress The market address 
 * @param tokenOut Address of the output token
 * @param amountIn Amount of input token in wei
 * @param slippage Slippage tolerance (e.g., 0.01 for 1%)
 * @returns Promise with transaction data
 */
export async function getSwapTransaction(
  marketAddress: string,
  tokenOut: string,
  amountIn: string,
  slippage: number = 0.01
): Promise<any> {
  try {
    // ETH is always used as the input token
    const actualTokenIn = ETH_ADDRESS;
    
    console.log(`Using market: ${marketAddress}`);
    console.log(`Swapping from ${actualTokenIn} to ${tokenOut}`);
    
    // Use environment variable for receiver address, error if not set
    if (!process.env.WALLET_ADDRESS) {
      throw new Error("WALLET_ADDRESS environment variable is not set.");
    }
    const RECEIVER = process.env.WALLET_ADDRESS;
    const chainId = 1;

    console.log(`Wallet address: ${RECEIVER}`);
    console.log(`Slippage: ${slippage}`);

    // Use v2 API for swap
    const url = `${BASE_URL}/sdk/${chainId}/markets/${marketAddress}/swap`;
    
    console.log("API URL:", url);
    console.log("Payload:", {
      tokenIn: actualTokenIn,
      tokenOut,
      amountIn,
      slippage,
      receiver: RECEIVER,
      enableAggregator: true
    });
    
    const response = await axios.get(url, {
      params: {
        tokenIn: actualTokenIn,
        tokenOut: tokenOut,
        amountIn: amountIn,
        slippage: slippage,
        receiver: RECEIVER,
        enableAggregator: true
      }
    });

    if (!response.data || !response.data.tx) {
      throw new Error("No transaction data returned from API");
    }

    console.log("Swap transaction data fetched successfully");
    return response.data.tx;
  } catch (error: any) {
    console.error("Error fetching swap transaction:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    // For development/testing, throw the error instead of returning a mock
    throw new Error(`Failed to get swap transaction: ${error.message}`);
  }
}

/**
 * Executes a swap transaction
 * @param market The market to swap with
 * @param tokenOut Address of the output token
 * @param amountIn Amount of input token
 * @param slippage Slippage tolerance (e.g., 0.01 for 1%)
 * @returns Promise with transaction result
 */
export async function swap(
  market: SimplifiedPendleMarket,
  tokenOut: string,
  amountIn: string,
  slippage: number = 0.01
): Promise<SwapResponse> {
  try {
    console.log(`Preparing swap for market ${market.name}`);
    
    // Get the transaction data from the Pendle API
    const txData = await getSwapTransaction(
      market.address,
      tokenOut,
      amountIn,
      slippage
    );

    // In a production app, we would execute the transaction here:
    // const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    // const privateKey = process.env.PRIVATE_KEY;
    // const wallet = new ethers.Wallet(privateKey, provider);
    // const tx = await wallet.sendTransaction(txData);
    // console.log("Transaction sent. Hash:", tx.hash);
    // await tx.wait();
    // console.log("Transaction confirmed.");
    
    // For now, return a mock response
    console.log('Transaction data ready (execution skipped in development):', txData);
    return {
      hash: '0x' + Array(64).fill('0').join(''),
      status: 'pending'
    };
  } catch (error: any) {
    console.error("Error executing swap:", error.message);
    
    // Return a mock response for development
    return {
      hash: '0x' + Array(64).fill('1').join(''),
      status: 'failed'
    };
  }
}

/**
 * Creates a limit order
 * @param market The market for the limit order
 * @param tokenIn Address of the input token
 * @param tokenOut Address of the output token
 * @param amountIn Amount of input token
 * @param minAmountOut Minimum amount of output token
 * @returns Promise with limit order result
 */
export async function limitOrder(
  market: SimplifiedPendleMarket,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  minAmountOut: string
): Promise<LimitOrderResponse> {
  // This is a placeholder implementation
  console.log(`Creating limit order for market ${market.name}`);
  
  // Mock response
  return {
    id: '0',
    status: 'open'
  }
}

/**
 * Mints PT and YT tokens by depositing into a Pendle market
 * @param market The market to mint in
 * @param amountIn Amount of underlying tokens to deposit
 * @returns Promise with mint transaction result
 */
export async function mint(
  market: SimplifiedPendleMarket,
  amountIn: string
): Promise<MintResponse> {
  // This is a placeholder implementation
  console.log(`Minting in market ${market.name}`);
  
  // Mock response
  return {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    status: 'pending',
    ptReceived: '0',
    ytReceived: '0'
  }
}

/**
 * Redeems underlying tokens by burning PT and YT tokens
 * @param market The market to redeem from
 * @param ptAmount Amount of PT tokens to burn
 * @param ytAmount Amount of YT tokens to burn
 * @returns Promise with redeem transaction result
 */
export async function redeem(
  market: SimplifiedPendleMarket,
  ptAmount: string,
  ytAmount: string
): Promise<RedeemResponse> {
  // This is a placeholder implementation
  console.log(`Redeeming from market ${market.name}`);
  
  // Mock response
  return {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    status: 'pending',
    tokensReceived: '0'
  }
}

/**
 * Executes a transaction with the given transaction data
 * @param txData Transaction data to execute
 * @returns Promise with transaction hash
 */
export async function executeSwapTransaction(txData: any): Promise<{ hash: string }> {
  try {
    // Verify environment variables are set
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY environment variable is not set.");
    }
    console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
    
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("Sending transaction...");
    const tx = await wallet.sendTransaction(txData);
    console.log("Transaction sent. Hash:", tx.hash);
    
    // Wait for transaction to be confirmed
    await tx.wait();
    console.log("Transaction confirmed.");
    
    return {
      hash: tx.hash,
    };
  } catch (error: any) {
    console.error("Error executing transaction:", error.message);
    throw new Error(`Failed to execute transaction: ${error.message}`);
  }
}

/**
 * Get transaction data for swapping ETH to a specific token
 * @param marketAddress The market address
 * @param tokenOutAddress Address of the output token
 * @param amountIn Amount of ETH in wei
 * @param slippage Slippage tolerance (e.g., 0.01 for 1%)
 * @returns Promise with transaction result
 */
export async function getSwapEthToTokenTransaction(
  marketAddress: string,
  tokenOutAddress: string,
  amountIn: string,
  slippage: number = 0.01
): Promise<any> {
  try {
    // Get the transaction data - ETH is hardcoded as input token in getSwapTransaction
    const txData = await getSwapTransaction(
      marketAddress,
      tokenOutAddress,
      amountIn,
      slippage
    );
    
    return txData;
  } catch (error: any) {
    console.error("Error getting swap transaction data:", error.message);
    throw new Error(`Failed to get swap transaction data: ${error.message}`);
  }
}