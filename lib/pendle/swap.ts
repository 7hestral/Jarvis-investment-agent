import axios from 'axios'
import { ethers } from 'ethers'

// API base URL
const BASE_URL = 'https://api-v2.pendle.finance/core/v1'

// Interface for swap transaction data
export interface SwapTxData {
  to: string
  data: string
  value: string
  gasLimit?: string
}

// Native ETH is represented by the zero address in the Pendle API
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000"
// WETH address for API compatibility
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

/**
 * Gets swap transaction data for executing a Pendle swap
 * @param marketAddress The address of the Pendle market
 * @param tokenOutAddress The address of the token to receive (PT or YT)
 * @param amountInEth Amount of ETH to swap (in ETH units)
 * @param slippage Slippage tolerance as a decimal (e.g., 1.0 for 100%)
 * @param chainId Chain ID (default: 1 for Ethereum Mainnet)
 * @returns Promise with the transaction data required for executing the swap
 */
export async function getSwapTransactionData(
  marketAddress: string,
  tokenOutAddress: string,
  amountInEth: string,
  slippage: number = 1.0,
  chainId: number = 1
): Promise<SwapTxData> {
  try {
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
    const url = `${BASE_URL}/sdk/${chainId}/markets/${marketAddress}/swap`;
    
    // Normalize tokenOutAddress by removing "1-" prefix if it exists
    const normalizedTokenOut = tokenOutAddress.startsWith('1-') ? tokenOutAddress.substring(2) : tokenOutAddress;
    
    console.log(`[Swap] Original tokenOut address: ${tokenOutAddress}`);
    console.log(`[Swap] Normalized tokenOut address: ${normalizedTokenOut}`);
    
    // Create params object - always use WETH as tokenIn for API compatibility
    const params = {
      tokenIn: WETH_ADDRESS, // Use WETH instead of ETH_ADDRESS for API compatibility
      tokenOut: normalizedTokenOut,
      amountIn: amountInWei,
      slippage: slippage,
      receiver: RECEIVER,
      enableAggregator: true
    };
    
    console.log("[Swap API] Making request with params:", JSON.stringify(params, null, 2));
    
    // Make API request
    const response = await axios.get(url, { 
      params,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    // Check if response contains transaction data
    if (!response.data?.tx) {
      throw new Error('Invalid response: missing transaction data');
    }
    
    return response.data.tx;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(`Pendle API error: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Executes a swap transaction using the wallet's private key
 * @param txData Transaction data object from getSwapTransactionData
 * @returns Transaction hash if successful
 */
export async function executeSwap(txData: SwapTxData): Promise<{ hash: string }> {
  try {
    console.log("[Swap] Starting swap execution");
    console.log("[Swap] Transaction data to execute:", JSON.stringify({
      to: txData.to,
      dataLength: txData.data?.length || 0,
      value: txData.value ? ethers.formatEther(txData.value) + " ETH" : "0 ETH",
      gasLimit: txData.gasLimit || "auto"
    }, null, 2));
    
    // Get private key from environment variables
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is not set");
    }
    
    // Create provider and wallet - explicitly use localhost fork
    console.log("[Swap] Connecting to provider: http://localhost:8545");
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    // Check provider connectivity
    try {
      const blockNumber = await provider.getBlockNumber();
      const network = await provider.getNetwork();
      console.log(`[Swap] Connected to network: Chain ID ${network.chainId}, Current block: ${blockNumber}`);
    } catch (connError: any) {
      console.error("[Swap] Error connecting to provider:", connError);
      throw new Error(`Failed to connect to local provider: ${connError.message}`);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`[Swap] Using wallet address: ${wallet.address}`);
    
    // Check wallet balance
    try {
      const balance = await provider.getBalance(wallet.address);
      console.log(`[Swap] Wallet balance: ${ethers.formatEther(balance)} ETH`);
      
      // Check if we have enough funds
      const valueNeeded = BigInt(txData.value || '0');
      if (balance < valueNeeded) {
        console.error(`[Swap] Insufficient funds: Have ${ethers.formatEther(balance)} ETH, need at least ${ethers.formatEther(valueNeeded)} ETH plus gas`);
      } else {
        console.log(`[Swap] Sufficient funds available for transaction`);
      }
    } catch (balanceError) {
      console.error("[Swap] Error checking wallet balance:", balanceError);
    }
    
    console.log("[Swap] Executing transaction on local fork: http://localhost:8545");
    console.log("[Swap] Transaction data:", {
      to: txData.to,
      dataLength: txData.data?.length || 0,
      value: txData.value ? ethers.formatEther(txData.value) + " ETH" : "0 ETH",
      gasLimit: txData.gasLimit || "auto"
    });
    
    // Send transaction
    console.log("[Swap] Sending transaction...");
    const tx = await wallet.sendTransaction({
      to: txData.to,
      data: txData.data,
      value: txData.value,
      gasLimit: txData.gasLimit
    });
    
    console.log(`[Swap] Transaction sent! Hash: ${tx.hash}`);
    
    // Attempt to check if transaction was mined immediately
    // This is just an early validation, the transaction-service will do a more thorough check
    try {
      console.log(`[Swap] Doing quick receipt check for tx: ${tx.hash}`);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt) {
        console.log(`[Swap] Transaction already mined in block ${receipt.blockNumber}, status: ${receipt.status}`);
        if (receipt.status === 1) {
          console.log(`[Swap] Transaction successful! Gas used: ${receipt.gasUsed.toString()}`);
        } else {
          console.log(`[Swap] Transaction reverted on chain.`);
        }
      } else {
        console.log(`[Swap] Transaction not yet mined, waiting for confirmation will happen in transaction-service.`);
      }
    } catch (receiptError: any) {
      console.log(`[Swap] Error checking receipt (this is normal): ${receiptError.message}`);
    }
    
    return { hash: tx.hash };
  } catch (error: any) {
    console.error("[Swap] Error executing swap:", error);
    console.error("[Swap] Error details:", error.message);
    if (error.code) {
      console.error(`[Swap] Error code: ${error.code}`);
    }
    if (error.reason) {
      console.error(`[Swap] Error reason: ${error.reason}`);
    }
    // Log the full error for developer debugging
    console.error("[Swap] Full error:", JSON.stringify(error, null, 2));
    
    // Check for specific error cases and provide user-friendly messages
    if (error.reason === "Return amount is not enough") {
      console.error("[Swap] Detected 'Return amount is not enough' error");
      console.error("[Swap] This usually means price moved unfavorably or there's an issue with the token addresses");
      console.error("[Swap] Slippage is already at maximum (100%), so it might be a token address format issue");
      
      // Log transaction data to help debug
      console.error("[Swap] Transaction data that caused the error:", JSON.stringify({
        to: txData.to,
        value: txData.value,
        gasLimit: txData.gasLimit
      }, null, 2));
      
      throw new Error("Transaction failed: The price moved unfavorably during execution. Try using a smaller amount.");
    } else if (error.message && error.message.includes("Slippage: APPROX_EXHAUSTED")) {
      throw new Error("Transaction failed: Price impact exceeded slippage tolerance. Try increasing slippage tolerance or using a smaller amount.");
    } else if (error.code === "CALL_EXCEPTION" && error.revert) {
      // Handle any other revert errors with user-friendly messages
      throw new Error(`Transaction reverted: ${error.revert.args?.[0] || error.reason || "Unknown reason"}`);
    }
    
    throw new Error(`Error executing swap: ${error.message}`);
  }
}